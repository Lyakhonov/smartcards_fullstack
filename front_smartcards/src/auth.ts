export const saveToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const logout = (): void => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const isAuth = (): boolean => !!localStorage.getItem("token");
