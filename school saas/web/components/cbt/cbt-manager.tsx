
"use client"

import { useState } from "react"
import { QuizList } from "./quiz-list"
import { BuilderContainer } from "./builder-container"

interface CBTManagerProps {
    classId: string
    subjectId: string
    className?: string
    subjectName?: string
}

export function CBTManager({ classId, subjectId, className, subjectName }: CBTManagerProps) {
    const [view, setView] = useState<'list' | 'builder'>('list')
    const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>(undefined)

    const handleNew = () => {
        setSelectedQuizId(undefined)
        setView('builder')
    }

    const handleEdit = (id: string) => {
        setSelectedQuizId(id)
        setView('builder')
    }

    const handleCloseBuilder = () => {
        setSelectedQuizId(undefined)
        setView('list')
    }

    if (view === 'builder') {
        return (
            <BuilderContainer
                classId={classId}
                subjectId={subjectId}
                className={className}
                subjectName={subjectName}
                initialQuizId={selectedQuizId}
                onClose={handleCloseBuilder}
            />
        )
    }

    return (
        <QuizList
            classId={classId}
            subjectId={subjectId}
            onEdit={handleEdit}
            onNew={handleNew}
        />
    )
}
