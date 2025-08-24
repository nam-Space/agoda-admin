/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from "react-router";
import { useAppSelector } from "../../redux/hooks";

const ProtectedRoute = ({ children }: any) => {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            {user?.id ?
                <>
                    {children}
                </>
                :
                <Navigate to='/login' replace />
            }

        </>
    )
}

export default ProtectedRoute;