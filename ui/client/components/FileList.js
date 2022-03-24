import React, { useState } from 'react';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Typography from '@material-ui/core/Typography';

import DeletionDialog from './DeletionDialog';
import FileCardList from './FileCardList';

import { useConfigs, useOutputFiles } from './SWRHooks';

const FileTile = ({ item }) => {
  const fileParts = new URL(`file://${item}`).pathname.split('/');
  const fileName = fileParts.pop();
  const filePath = fileParts.join('/').replace('/home/clouseau/', '~/');
  return (
    <span>
      <Typography variant="subtitle1" noWrap>{fileName}</Typography>
      <Typography variant="caption" noWrap component="div">{filePath}</Typography>
    </span>
  );
};

const FileList = ({
  fileType, model, disabledMode, setShorthandMode, setShorthandContents,
  setOpenShorthand, setSpacetagFile, setSpacetagOpen, hideExpandHeader,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletionSelection, setDeletionSelection] = useState(() => ({
    type: null, id: null, description: 'Hello world',
  }));

  const {
    configs, configsLoading, configsError, mutateConfigs
  } = useConfigs(model?.id);
  const {
    outputs, outputsLoading, outputsError, mutateOutputs
  } = useOutputFiles(model.id);

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletionSelection();
  };

  const handleDeleteItem = async () => {
    console.log('deleting', deletionSelection);
    let url = `/api/dojo/dojo/${deletionSelection.type}/${deletionSelection.id}`;
    // Add params to end of URL is params included in deletionSelection
    if (deletionSelection?.params) {
      const paramList = [];
      Object.entries(deletionSelection.params).forEach(([key, val]) => {
        paramList.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      });
      url = `${url}?${paramList.join('&')}`;
    }

    const resp = await fetch(
      url,
      {
        method: 'DELETE',
      }
    );

    if (resp.ok) {
      handleDeleteDialogClose();
      // Dojo needs 1 second to update the DB before we can GET the accessories again
      if (deletionSelection.type === 'config') {
        setTimeout(() => mutateConfigs(), 1000);
      } else if (deletionSelection.type === 'outputfile') {
        setTimeout(() => { mutateOutputs(); }, 1000);
      }
    } else {
      console.log(`There was an error deleting "${deletionSelection.description}"`);
    }
  };

  const openConfigShorthand = async (item) => {
    const response = await fetch(
      `/api/clouseau/container/${model.id}/ops/cat?path=${encodeURIComponent(item.path)}`
    );

    if (response.ok) {
      const content = await response.text();

      setShorthandContents({
        editor_content: content,
        content_id: item.path,
      });

      setShorthandMode('config');
      setOpenShorthand(true);
    }
  };

  const renderConfigs = () => (
    <FileCardList
      name="Config"
      files={configs}
      loading={configsLoading}
      error={configsError}
      primaryClickHandler={(config) => openConfigShorthand(config)}
      primaryIcon={<EditIcon />}
      secondaryClickHandler={async (config) => {
        setDeletionSelection({
          type: 'config',
          id: config.model_id,
          description: config.path,
          params: {
            path: config.path,
          },
        });
        setDeleteDialogOpen(true);
      }}
      hideExpandHeader={hideExpandHeader}
      secondaryIcon={<DeleteIcon />}
      cardContent={(config) => <FileTile item={config.path} />}
      disableClick={disabledMode}
      parameters={model?.parameters}
    />
  );

  const renderOutputs = () => (
    <FileCardList
      name="Output"
      files={outputs}
      loading={outputsLoading}
      error={outputsError}
      primaryClickHandler={(output) => {
        setSpacetagFile(output);
        setSpacetagOpen(true);
      }}
      primaryIcon={<EditIcon />}
      secondaryClickHandler={(config) => {
        setDeletionSelection({
          type: 'outputfile', id: config.id, description: `${config.name}: ${config.path}`
        });
        setDeleteDialogOpen(true);
      }}
      hideExpandHeader={hideExpandHeader}
      secondaryIcon={<DeleteIcon />}
      disableClick={disabledMode}
      cardContent={(output) => (
        <>
          <Typography variant="subtitle1" noWrap>{output.name}</Typography>
          <Typography variant="caption" noWrap component="div">{output.path}</Typography>
        </>
      )}
      parameters={model?.outputs}
    />
  );

  return (
    <>
      {fileType === 'config' ? renderConfigs() : renderOutputs()}
      <DeletionDialog
        open={deleteDialogOpen}
        itemDescr={deletionSelection?.description}
        deletionHandler={handleDeleteItem}
        handleDialogClose={handleDeleteDialogClose}
      />
    </>
  );
};

export default FileList;
