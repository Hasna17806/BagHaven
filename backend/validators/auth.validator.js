import Joi from "joi";

/*
  USER REGISTER VALIDATION
*/
export const userRegisterSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/*
  LOGIN VALIDATION (User & Admin)
*/
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
