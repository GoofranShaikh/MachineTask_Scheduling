const Joi = require('joi');

const registrationSchema = Joi.object({
    Name:Joi.string().required(),
    Email:Joi.string().email().required(),
    Password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9@]{6,16}$")),
    RoleId:Joi.string().required()
})

const roleSchema = Joi.object({
    RoleName:Joi.string().required(),
    Description:Joi.string().required().min(8).max(100)
})

const forgotPasswordSchema = Joi.object({
    Email:Joi.string().email().required(),
})

const resetPasswordSchema = Joi.object({
    Password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9@]{6,16}$")),
})
const loginSchema = Joi.object({
    Email:Joi.string().email().required(),
    Password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9@]{6,16}$")),
})

const permissionSchema = Joi.object({
    PermissionName: Joi.string().min(3).required(),
    Description: Joi.string().min(8).required(100)
})

const rolePremissionSchema = Joi.object({
    RoleId:Joi.string().required(),
    Permission_ids: Joi.array().items(Joi.string()).min(1).required()
  });
  

module.exports ={registrationSchema,roleSchema,forgotPasswordSchema,resetPasswordSchema,loginSchema,permissionSchema,rolePremissionSchema};