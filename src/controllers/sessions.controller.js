import { generateToken, validatePassword, createHash } from "../services/auth.js";
import UsersDTO from "../dtos/user/UsersDTO.js";
import { usersService } from '../services/index.js';
import MailingService from "../services/MailingService.js";
import DTemplates from "../constants/DTemplates.js";
import config from "../config.js";
import jwt from 'jsonwebtoken';
import moment from "moment-timezone";

const getCurrent = (req, res) => {
  const currentUser = req.user;
  res.sendSuccessWithPayload(currentUser);
}

const register = async (req, res) => {
  const mailingService = new MailingService();
  try {
    const result = await mailingService.sendMail(req.user.email, DTemplates.WELCOME, { user: req.user })
    console.log(result);
    res.sendSuccess("Registered");
  } catch (error) {
    res.sendInternalError(error);
  }

}

const loginWithToken = async (req, res) => {
  const user = req.user;
  // Actualizando la propiedad "last_connection" con la fecha y hora actual cuando el user se loguea.
  user.last_connection = moment().tz('America/Santiago').format('DD/MM/YYYY[, a las] HH:mm:ss [GMT]ZZ');

  //Actualizo al usuario en la base de datos
  const newUser = await usersService.updateUser(user.id, user)

  try {
    const token = generateToken(req.user);
    //Aqui envío el token generado para el usuario, al frontend, por una cookie.
    //El siguiente paso es extraer el token de la cookie con la estrategia 'jwt' -> passport.config.js :72
    res.cookie(config.jwt.COOKIE, token, {
      maxAge: 1000 * 3600 * 24,   //1seg*1hr*24hrs = 24hrs
      httpOnly: true
    }).sendSuccess("Logged In")   //Logeado con exito
  } catch (error) {
    res.sendInternalError(error);
  }
}

const githubInit = (req, res) => { }

const githubLoginWithToken = (req, res) => {
  const userDTO = new UsersDTO.GithubTokenDTO(req);
  const user = { ...userDTO }
  const accessToken = generateToken(user);

  res.cookie(config.jwt.COOKIE, accessToken, {
    maxAge: 1000 * 3600 * 24,
    httpOnly: true
  }).sendSuccess("Github login success")
}

const logout = async (req, res) => {
  // Borra la cookie en la respuesta
  res.clearCookie(config.jwt.COOKIE);

  const user = req.user;
  // Actualizando la propiedad "last_connection" con la fecha y hora actual cuando el user se loguea.
  user.last_connection = moment().tz('America/Santiago').format('DD/MM/YYYY[, a las] HH:mm:ss [GMT]ZZ');

  //Actualizo al usuario en la base de datos
  const newUser = await usersService.updateUser(user.id, user)

  // Envía una respuesta JSON que indica el logout exitoso
  res.sendSuccess("Logged Out");
}

const restoreRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendBadRequest('No se proporcionó un email');
  const user = await usersService.getUserBy({ email });
  if (!user) return res.sendBadRequest('Email no válido');
  //Hasta aquí todo bien. Creamos un restoreToken.
  const userDTO = new UsersDTO.RestoreTokenDTO({ email });
  const newUser = { ...userDTO }
  const restoreToken = generateToken(newUser, '24h');
  //En caso de usar WhiteList, aca se guardaria el token en la White List
  const mailingService = new MailingService();
  const result = await mailingService.sendMail(user.email, DTemplates.RESTORE, { restoreToken })
  console.log(result);
  res.sendSuccess('Correo Enviado')
}

const restorePassword = async (req, res) => {
  const { password, token } = req.body;
  try {
    const tokenUser = jwt.verify(token, config.jwt.SECRET);
    const user = await usersService.getUserBy({ email: tokenUser.email });

    //Verificando que la constraseña del usuario no sea la misma que ya tenía
    const isSamePassword = await validatePassword(password, user.password);
    if (isSamePassword) return res.sendBadRequest('Su contraseña es la misma');
    const newHasedPassword = await createHash(password);
    await usersService.updateUser(user._id, { password: newHasedPassword });
    //Aquí se borraría el token del WhiteList
    res.sendSuccess('Contraseña Cambiada');
  } catch (error) {
    console.log(error);
  }
};


export default {
  getCurrent,
  register,
  loginWithToken,
  githubInit,
  githubLoginWithToken,
  logout,
  restoreRequest,
  restorePassword
}