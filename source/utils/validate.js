import Joi from "joi";

const validateUser = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    userName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export {validateUser}