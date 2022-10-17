import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';

const options = ['Download dataset - (Long format)','Download dataset - (Wide format)'];

export default function DatasetDownloadSplitButton({ dataset, className }) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [wideFormat, setWideFormat] = React.useState(false);
  let dataset_url= useState(`/api/dojo/indicators/${dataset.id}/download/csv?wide_format=false`)
  let final_url=useState('')
  
  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
   
    if(index==1){
        setWideFormat(true)
    }else{
        setWideFormat(false)    
    }

    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const returnCorrectUrl= () =>{
    
    dataset_url='/api/dojo/indicators/'+`${dataset.id}`+'/download/csv?wide_format='+`${wideFormat}`
    //  for some reason it is adding on ,function () { [native code] } so I am removing that
    final_url=dataset_url.split(",")[0]
    return final_url
  }

  return (
    <Typography component={'span'} variant="body2" className={className}>

        <ButtonGroup variant="outlined" color="primary" ref={anchorRef} aria-label="split button">
          <Button 
            href={(returnCorrectUrl())}
            download={`${dataset.id}.csv`}
            type="text/csv"
            >{options[selectedIndex]}</Button>
          <Button
            variant="outlined"
            color="primary"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
          

        </ButtonGroup>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        disabled={index === 2}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        </Typography>

  );
}