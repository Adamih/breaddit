import { MyCredintialsValidationErrors, RegisterInput } from "../types";
import validator from "validator";
import { UserInputError } from "apollo-server-express";

export async function validateRegister(options: RegisterInput) {
  const validationErrors: MyCredintialsValidationErrors = {};
  if (options.username.length <= 2) {
    validationErrors.username = "Username length must be greater than 2";
  } else if (!validator.isAlphanumeric(options.username)) {
    validationErrors.username = "Username can only contain letters and numbers";
  }

  if (!validator.isEmail(options.email)) {
    validationErrors.email = "Must be a valid e-mail address";
  }
  if (options.password.length <= 2) {
    validationErrors.password = "Password length must be greater than 2";
  }

  if (Object.keys(validationErrors).length > 0) {
    throw new UserInputError("Failed to register due to validation errors", {
      validationErrors,
    });
  }
}
