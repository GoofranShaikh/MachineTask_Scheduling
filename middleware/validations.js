// const Joi = require('joi');

const validationMiddleware = (schema)=>{

    return (req,res,next)=>{
        try{
            const options ={
                abortEarly:false,
                allowUnknown: true, // ignore unknown props
            };
            
            const {error,value} = schema.validate(req.body,options);
            
            if (error) {
                const errorMessage = error.details.map(detail => detail.message).join(', ');
                return res.status(400).json({ error: errorMessage });
            } 
            next();
            }
            catch(err){
                return res.status(400).json({msg:'validation error',error:err.message});
            }
        }
        }

        module.exports = validationMiddleware;
    
