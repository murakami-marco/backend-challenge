const Joi = require('joi');

const locationSchema = Joi.object({
  street: Joi.string().required().messages({
    'any.required': 'Street is required',
  }),
  city: Joi.string().required().messages({
    'any.required': 'City is required',
  }),
  state: Joi.string().required().messages({
    'any.required': 'State is required',
  }),
  zip: Joi.string().required().messages({
    'any.required': 'ZIP code is required',
  }),
  country: Joi.string().required().messages({
    'any.required': 'Country is required',
  }),
});

const createOrganizationSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Organization name is required',
  }),
  addresses: Joi.array().items(locationSchema).default([]),
});

const jsonPatchSchema = Joi.array().items(
  Joi.object({
    op: Joi.string()
      .valid('add', 'remove', 'replace', 'move', 'copy', 'test')
      .required(),
    path: Joi.string().required(),
    value: Joi.any(),
    from: Joi.string(),
  })
);

const validateCreateOrganization = (req, res, next) => {
  const { error } = createOrganizationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
    });
  }
  next();
};

const validateJsonPatch = (req, res, next) => {
  const { error } = jsonPatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = {
  validateCreateOrganization,
  validateJsonPatch,
};
