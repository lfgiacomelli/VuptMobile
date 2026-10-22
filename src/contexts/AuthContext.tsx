import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import {
  saveUser,
  getUser,
  saveToken,
  getToken,
  removeUserAndToken,
} from "../storage/authUserStorage";
import { UserDTO } from "../dtos/UserDTO";

export type AuthUser = UserDTO;

type SignUpPayload = {
  usu_nome: string;
  usu_email: string;
  usu_senha: string;
  usu_telefone: string;
  usu_cpf: string;
  usu_status: string;
};

type UpdateUserProfileDTO = {
  usu_nome: string;
  usu_email: string;
  usu_telefone: string;
  usu_cpf: string;
};

type AuthContextData = {
  user: AuthUser | null;
  loading: boolean;
  signInUser: (usu_email: string, usu_senha: string) => Promise<void>;
  signUpUser: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileDTO) => Promise<void>;
  isProfileIncomplete: boolean;
  missingProfileFields: string[];
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function persistAuthSession(payloadUser: UserDTO, token: string) {
    setUser(payloadUser);
    await saveUser(payloadUser);
    await saveToken(token);
  }

  async function signInUser(usu_email: string, usu_senha: string) {
    try {
      const { data } = await api.post("/auth/user/login", {
        usu_email,
        usu_senha,
      });

      const token = data.token;
      const payloadUser: UserDTO = data.user;

      await persistAuthSession(payloadUser, token);
      console.log("✅ Login bem-sucedido:", payloadUser);
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      throw error;
    }
  }

  async function signUpUser(payload: SignUpPayload) {
    try {
      const { data } = await api.post("/users/", payload);

      const token = data.token;
      const createdUser: UserDTO = data.data;

      await persistAuthSession(createdUser, token);
      console.log("✅ Conta criada com sucesso:", createdUser);
    } catch (error) {
      console.error("❌ Erro ao criar conta:", error);
      throw error;
    }
  }

  async function updateUserProfile(data: UpdateUserProfileDTO) {
    try {
      if (!user?.usu_codigo) {
        throw new Error("Usuário não autenticado.");
      }

      const response = await api.put(`/users/${user.usu_codigo}`, data);

      const updatedUserFromApi: Partial<UserDTO> =
        response?.data?.data ?? response?.data?.user ?? {};

      const mergedUser: AuthUser = {
        ...user,
        ...updatedUserFromApi,
        ...data,
      };

      setUser(mergedUser);
      await saveUser(mergedUser);
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      throw error;
    }
  }

  async function loadStorageData() {
    try {
      const storedUser = await getUser();
      const storedToken = await getToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
      }
    } catch (error) {
      console.log("Erro ao carregar usuário do storage:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setUser(null);
    await removeUserAndToken();
  }

  useEffect(() => {
    loadStorageData();
  }, []);

  const missingProfileFields = useMemo(() => {
    if (!user) return [];

    return [
      !user.usu_nome?.trim() && "nome",
      !user.usu_email?.trim() && "email",
      !user.usu_telefone?.trim() && "telefone",
      !user.usu_cpf?.trim() && "cpf",
    ].filter(Boolean) as string[];
  }, [user]);

  const isProfileIncomplete = missingProfileFields.length > 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInUser,
        signUpUser,
        signOut,
        updateUserProfile,
        isProfileIncomplete,
        missingProfileFields,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}