import httpStatus from "http-status";
import {User} from "../models/user.model"


const register = async (req,res)=>{
    const {name, username, password} = req.body;
    try{
        const existingUser = await User.findone({username});
        if (existingUser){
            return res.status(httpStatus.FOUND).json({message: "user already exists"});
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name:name,
        username: username,
        password: hashedPassword
    
    });

    await newUser.save();

    res.status(httpStatus.CREATED).json({message: "user registered"})

} catch (e){
    res.json({message: "Something Went Worng"})

}
};