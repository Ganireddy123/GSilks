import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { replaceAdminUser, setAdminError, setAdminLoading, setAdminResource } from "../State/slices/adminSlice";
import AppAPI from "../API";

const fetchUsers = (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    AppAPI.adminUsers.get()
      .then((result) => dispatch(setAdminResource({ resource: "users", items: result.data?.users || [] })))
      .catch((e) => dispatch(setAdminError(e.message)));
  } catch (err) {
    dispatch(setAdminError(err.message));
  }
};

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  useEffect(() => { fetchUsers(dispatch); }, [dispatch]);

  const changeStatus = (id, is_active) => {
    try {
      AppAPI.adminUpdateUserStatus.put(undefined, { id, is_active })
        .then((result) => dispatch(replaceAdminUser(result.data?.user)))
        .catch((e) => dispatch(setAdminError(e.message)));
    } catch (err) {
      dispatch(setAdminError(err.message));
    }
  };

  return <Box sx={{ p: { xs: 2, md: 4 } }}>
    <Typography component="h1" variant="h4" sx={{ mb: 3 }}>Users</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {loading && !users.length && <Typography>Loading users...</Typography>}
    {users.map((user) => <Box key={user.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
      <Box><Typography fontWeight={700}>{user.name}</Typography><Typography color="text.secondary">{user.email} · {user.role}</Typography></Box>
      {user.role !== "ADMIN" && <Button color={user.is_active ? "error" : "primary"} onClick={() => changeStatus(user.id, !user.is_active)}>{user.is_active ? "Deactivate" : "Activate"}</Button>}
    </Box>)}
  </Box>;
}
