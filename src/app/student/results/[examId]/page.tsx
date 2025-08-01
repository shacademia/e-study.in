"use client";
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ExamResults from './ExamResults';

const ExamResultsPage = () => {
  const params = useParams();
  const examId = params?.examId as string;

    // const fetchFN = async ()=> {
    //   const res = await fetch(`/api/submissions/3e8468cd-4ec4-4385-9dab-5f9088eba583`,{
    //     credentials: 'include',
    //   }
    //   );
  
    //   if (!res.ok) {
    //     throw new Error('Failed to fetch image');
    //   }
  
    //   const data = await res.json();
    //   return data;
    // }
  
  
    // useEffect(() => {
    //     const getData = async () => {
    //         const data = await fetchFN();
    //         console.log('000000000000000000000000', data);
    //     };
    //
    //     getData();
    // }, []);
    
    // console.log('1000000000000000000000000');
  

  return <ExamResults examId={examId} />;
};

export default ExamResultsPage;
