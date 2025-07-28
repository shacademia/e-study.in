"use client";
import React from "react";
import { useParams } from "next/navigation";
import ExamInterface from "./ExamInterface";

const ExamPage = () => {
  const params = useParams();
  const examId = params?.examId as string;

  return <ExamInterface examId={examId} />;
};

export default ExamPage;
