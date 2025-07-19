import React from "react";
import { useParams } from "next/navigation";
import MultiSectionExamInterface from "./MultiSectionExamInterface";

const MultiSectionExamInterfacePage = () => {
  const params = useParams();
  const examId = params?.examId as string;

  return <MultiSectionExamInterface examId={examId} />;
};

export default MultiSectionExamInterfacePage;
