import axios from "axios";
import { createContext, useState } from "react";



export const AuthContext = createContext({});


export const AuthProvider = ({ children }) => {

    const client = axios.create({
        baseURL: "http://localhost:8000/api/v1/users"
    })

    const [userData, setUserData] = useState(null);

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })

            if (request.status === 201) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", { username, password });

            if (request.status === 200) {
                localStorage.setItem("token", request.data.token);
                return "Login Successful";
            }
        } catch (err) {
            throw err;
        }
    };


 const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    } 


     const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }


    const data = {
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser,addToUserHistory
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}