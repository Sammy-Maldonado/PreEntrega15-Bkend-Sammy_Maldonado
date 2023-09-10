import { usersService } from "../services/index.js";

const getUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUser();
    res.status(200).send({ status: "success", payload: users });
  } catch (error) {
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

const getUserById = async (req, res) => {
  try {
    const userId = req.params.uId;
    const user = await usersService.getUserById(userId);
    if (user) {
      res.send({ status: "success", message: `El usuario '${user.name}', se ha cargado correctamente`, payload: user });
    } else {
      res.status(400).send({ status: "error", error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' })
  }
}

const addUsers = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = req.body;

    const newUser = await usersService.createUser(user);
    res.status(200).send({ status: "success", payload: newUser });
  } catch (error) {
    res.status(400).send({ status: "error", error: error.message });
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.params.pId;
    const userToUpdate = req.body;

    //Verificando que el usuario exista en la base de datos
    const userExists = await usersService.getUserById(userId);
    if (!userExists) {
      return res.status(404).send({ status: "error", message: "Usuario no encontrado, por favor, ingrese una ID válida" });
    }

    const result = await usersService.updateUser(userId, userToUpdate)
    const newUser = await usersService.getUserById(userId)
    console.log(result);
    res.send({ status: "success", message: "Usuario actualizado con éxito", payload: newUser })
  } catch (error) {
    console.log(error);
    res.status(400).send('Usuario no encontrado')
  }
}

const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.uId;
    const user = await usersService.getUserById(userId);
  
    if (!user) {
      return res.status(404).send({ status: 'error', error: 'Usuario no encontrado, por favor, ingrese una ID válida' });
    }
  
    // Verificando si el usuario es "premium" y quiere cambiar a "user"
    if (user.role === 'premium') {
      // Cambiando el rol del usuario a "user" y estableciendo el status como false
      user.role = 'user';
      user.status = false;
  
      // Actualizando el usuario en la base de datos
      const updatedUser = await usersService.updateUser(userId, user);
      const newUserRole = await usersService.getUserById(userId);
  
      return res.status(200).send({ status: 'success', message: 'Rol de usuario actualizado con éxito', payload: newUserRole });
    }
  
    // Verificando si los documentos han sido cargados
    if (!user.documents || user.documents.length < 3) {
      return res.status(400).send({ status: 'error', error: 'El usuario no ha cargado los 3 documentos requeridos' });
    }
  
    // Verificando que los documentos sean los correctos
    const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
  
    const uploadedDocuments = user.documents.map((doc) => doc.reference);
    const missingDocuments = requiredDocuments.filter((doc) => !uploadedDocuments.includes(doc));
  
    if (missingDocuments.length > 0) {
      return res.status(400).send({ status: 'error', error: `Faltan los siguientes documentos: ${missingDocuments.join(', ')}` });
    }
  
    // Cambiando el rol del usuario después que se entregan los documentos necesarios
    user.role = 'premium';
    user.status = true;
  
    // Actualizar el usuario en la base de datos
    const updatedUser = await usersService.updateUser(userId, user);
    const newUserRole = await usersService.getUserById(userId);
  
    res.status(200).send({ status: 'success', message: 'Rol de usuario actualizado con éxito', payload: newUserRole });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.uId;

    const userToDelete = await usersService.getUserById(userId);
    if (!userToDelete) {
      return res.status(404).send({ status: "error", message: "Usuario no encontrado, por favor, ingrese una ID válida" })
    }

    //Verificando que solo el admin pueda borrar usuarios
    if (req.user.role === "admin") {
      const result = await usersService.deleteUser(userId);
      res.send({ status: "success", message: "El usuario ha sido eliminado con éxito", payload: result })
    } else {
      return res.status(403).send({ status: "error", error: "Acceso Denegado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

const updateUserData = async (req, res) => {
  try {
    const files = req.files;
    const userId = req.params.uId;
    const user = await usersService.getUserById(userId);
    console.log(files);
    if (!user) {
      return res.status(404).send({ status: 'error', error: 'Usuario no encontrado, por favor, ingrese una ID válida' });
    }

    // Obteniendo la información de los archivos cargados y agregandolos al array "documents"
    const documents = user.documents || []; // Se obtiene el array de documentos existente o se crea uno nuevo

    const requiredReferences = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
    files.forEach((file, index) => {
      const reference = index < requiredReferences.length ? requiredReferences[index] : file.originalname;
      documents.push({ name: file.originalname, reference: reference });
    });

    // Verificar si se han cargado los tres documentos requeridos
    const uploadedReferences = documents.map((doc) => doc.reference);
    const hasRequiredDocuments = requiredReferences.every((docRef) => uploadedReferences.includes(docRef));

    // Actualizar el estado del usuario si se han cargado los tres documentos
    if (hasRequiredDocuments) {
      user.status = true;
    }

    // Actualizando el usuario en la base de datos con el nuevo array "documents"
    const updatedUser = await usersService.updateUser(userId, { documents, status: user.status });
    const newUser = await usersService.getUserBy(updatedUser._id);

    res.status(200).send({ status: 'success', message: 'Archivo cargado con éxito', payload: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
  }
};

export default {
  getUsers,
  getUserById,
  addUsers,
  updateUser,
  changeUserRole,
  deleteUser,
  updateUserData
}