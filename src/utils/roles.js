export const roleMap = {
  1: "usuario",
  2: "empresa",
  3: "delivery",
  4: "admin",
  5: "moderador",
};

export const roleReverseMap = {
  usuario: 1,
  empresa: 2,
  delivery: 3,
  admin: 4,
  moderador: 5,
};

export function mapearRoleIdANombre(roleId) {
  if (typeof roleId === 'string') return roleId;
  return roleMap[roleId] || null;
}