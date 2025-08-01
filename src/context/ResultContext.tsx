"use client";
import type { ApiResponse } from "@/app/student/results/[examId]/types";
import { createContext, useState } from "react";
import { useContext } from "react";

interface ResultContextType {
    ResultData: ApiResponse | null;
    setResultData: React.Dispatch<React.SetStateAction<ApiResponse | null>>;
    fetchResultData: (examId: string) => Promise<void>;
    loading: boolean;
}

export const ResultContext = createContext<ResultContextType | undefined>(undefined);

export const ResultProvider = ResultContext.Provider;

export function ResultContextProvider({children}: {children: React.ReactNode}) {
    const [ResultData, setResultData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false); 

    const fetchResultData = async (submissionId: string): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`/api/submissions/${submissionId}`);
            const data = await response.json();
            setResultData(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching result data:", error);
        }
    };

    return (
        <ResultProvider value={{ResultData, setResultData, fetchResultData, loading}}>
            {children}
        </ResultProvider>
    );
}


export function useResult(): ResultContextType {
    const context = useContext(ResultContext);
    if (context === undefined) {
        throw new Error('useResult must be used within a ResultProvider');
    }
    return context;
}