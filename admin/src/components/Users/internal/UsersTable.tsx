import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { ActionFormType, User } from '../../../models/user';
import React, { RefObject } from 'react';
import { Button, Stack } from '@mui/material';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  setPage: React.Dispatch<React.SetStateAction<any>>;
  setLimit: React.Dispatch<React.SetStateAction<any>>;
  setOpenFormModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  setActionForm: (action: ActionFormType) => void;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  setSelectedUser,
  setPage,
  setLimit,
  setOpenFormModal,
  setActionForm,
}: UsersTableProps): React.JSX.Element {
  const handleOpenFormModalEdit = (user: User, action: ActionFormType) => {
    setOpenFormModal(true);
    setSelectedUser(user);
    setActionForm(action);
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto', overflowY: 'scroll', maxHeight: 400 }}>
        <Table sx={{ minWidth: '800px' }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Mezon ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Map</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Gold</TableCell>
              <TableCell>Diamond</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {row.mezon_id ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{row.username}</Typography>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>{' '}
                  <TableCell>{row.gender}</TableCell>
                  <TableCell>{row.map?.name ?? '-'}</TableCell>
                  <TableCell>{row.display_name}</TableCell>
                  <TableCell>{row.gold}</TableCell>
                  <TableCell>{row.diamond}</TableCell>
                  <TableCell>
                    {dayjs(row.created_at).format('MMM D, YYYY')}
                  </TableCell>
                  <TableCell>
                    <Stack direction="column" spacing={1}>
                      <Button
                        onClick={() =>
                          handleOpenFormModalEdit(row, ActionFormType.EDIT)
                        }
                        variant="contained"
                        color="success"
                        sx={{
                          justifyContent: 'flex-center',
                          gap: 1.5,
                          paddingLeft: 2,
                        }}
                      >
                        <PencilIcon width="20px" height="20px" />
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{
                          justifyContent: 'flex-center',
                          gap: 1.5,
                          paddingLeft: 2,
                        }}
                      >
                        <TrashIcon width="20px" height="20px" />
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={(_, page: number) => {
          setPage(page);
        }}
        onRowsPerPageChange={(event) => {
          setLimit(event.target.value);
        }}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
