"use client";

import React, { ReactNode } from 'react'


import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {AuthProvider} from "@/contexts/AuthContext";

const layout = ({children}:{children:ReactNode}) => {
  return (
        <AuthProvider>
            <ProtectedRoute>
                {children}
            </ProtectedRoute>
        </AuthProvider>
  )
}

export default layout
