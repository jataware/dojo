import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import FileCardList from './FileCardList';

import { useAccessories } from './SWRHooks';

export default function SummaryAccessories({ modelId }) {
  const {
    accessories, accessoriesLoading, accessoriesError, mutateAccessories
  } = useAccessories(modelId);

  const [deleteAccessoryDialogOpen, setDeleteAccessoryDialogOpen] = useState(false);
  const [accessoryToDelete, setAccessoryToDelete] = useState();

  const handleDialogClose = () => {
    setDeleteAccessoryDialogOpen(false);
    setAccessoryToDelete();
  };

  const handleDeleteAccessory = async () => {
    const filteredAccessories = accessories.filter((currentAccessory) => (
      currentAccessory.id !== accessoryToDelete.id
    ));

    const resp = await fetch('/api/dojo/dojo/accessories', {
      method: 'PUT',
      body: JSON.stringify(filteredAccessories),
    });

    if (resp.ok) {
      handleDialogClose();
      // Dojo needs 1 second to update the DB before we can GET the accessories again
      setTimeout(() => mutateAccessories(), 1000);
    } else {
      console.log(`There was an error deleting ${accessoryToDelete.path}`);
    }
  };

  return (
    <>
      <FileCardList
        name="Accessories"
        files={accessories}
        loading={accessoriesLoading}
        error={accessoriesError}
        clickHandler={(accessory) => {
          setAccessoryToDelete(accessory);
          setDeleteAccessoryDialogOpen(true);
        }}
        icon={<DeleteIcon />}
        cardContent={(accessory) => {
          const pathArray = accessory.path.split('/');
          const name = pathArray[pathArray.length - 1];

          return (
            <>
              <Typography variant="subtitle1">{name}</Typography>
              <Typography variant="caption">{accessory.path}</Typography>
            </>
          );
        }}
      />
      <Dialog
        open={deleteAccessoryDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Are you sure you want to delete this accessory file?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {accessoryToDelete?.path}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>No</Button>
          <Button onClick={handleDeleteAccessory}>Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
