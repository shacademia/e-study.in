import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { uploadProfilePicture } from "@/services/supabase/storage";
import jwt from "jsonwebtoken";
import formidable from "formidable";

// Disable Next.js default body parser to use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Authorization token required" });
  }

  const token = authHeader.substring(7);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  const userId = decodedToken.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const form = new formidable.IncomingForm({ maxFileSize: 5 * 1024 * 1024 }); // 5MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file upload" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || typeof file !== "object" || !("mimetype" in file)) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided or invalid file" });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.mimetype || "")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file type" });
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return res
        .status(400)
        .json({ success: false, message: "File size exceeds 5MB limit" });
    }
    if (!file.filepath) {
      return res
        .status(400)
        .json({ success: false, message: "File upload failed" });
    }
    try {
      const imageUrl = await uploadProfilePicture(userId, file);
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: imageUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          role: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: { imageUrl, user: updatedUser },
      });
    } catch (uploadErr) {
      console.error(uploadErr);
      return res.status(500).json({ success: false, message: "Upload failed" });
    }
  });
}
