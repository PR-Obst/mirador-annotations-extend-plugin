import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemText } from '@material-ui/core';
import { Check, Cancel } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { Collapse } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { NativeSelect, FormControl, InputLabel } from '@material-ui/core';
import AnnotationTextEditorItem from '../containers/AnnotationTextEditorItem';
import AnnotationTextFieldItem from '../containers/AnnotationTextFieldItem';
import ReactHtmlParser from 'react-html-parser';

class AnnotationBodyItem extends Component {
    constructor(props) {
        super(props);

        const bodyState = {
            value: null,
            type: null,
            purpose: null
        }

        this.state = {
            purposeOptionState: 0,
            ...bodyState,
        }

        this.edit = this.edit.bind(this);
        this.confirm = this.confirm.bind(this);
        this.cancel = this.cancel.bind(this);
        this.delete = this.delete.bind(this);
        this.handleSelectedPurposeOption = this.handleSelectedPurposeOption.bind(this);
        this.updateBodyValue = this.updateBodyValue.bind(this);
    }

    componentDidMount() {
        const { body, edit, handleEdit, bodyPos } = this.props;
        if(body.value) {
            this.setState({ value: body.value });
        }
        if(edit == null) {
            handleEdit(bodyPos, 'body');
        }
        if(body.type) {
            this.setState({ type: body.type });
        }
        if(body.purpose) {
            this.setState({ purpose: body.purpose });
            switch(body.purpose) {
                case 'describing':
                    this.setState({ purposeOptionState: 0 });
                    break;
                case 'tagging':
                    this.setState({ purposeOptionState: 1 });
                    break;
                default:
                    this.setState({ purposeOptionState: 0 });
                    break;
            }
        }
    }

    edit() {
        const { edit, bodyPos, handleEdit } = this.props;
        if(edit == null) {
            handleEdit(bodyPos, 'body');
        }
    }

    confirm() {
        const { value, type, purpose } = this.state;
        const { bodyPos, handleSubmit, body, handleEdit } = this.props;

        handleSubmit('body', { value: value, type: type, purpose: purpose, _temp_id: body._temp_id }, bodyPos);
        handleEdit(null, 'body');
    }

    handleSelectedPurposeOption(e) {;
        this.setState({ purpose: e.target.value });
        switch(e.target.value) {
            case 'describing':
                this.setState({ purposeOptionState: 0 });
                break;
            case 'tagging':
                this.setState({ purposeOptionState: 1 });
                break;
            default:
                this.setState({ purposeOptionState: 0 });
                break;
        }
    }

    updateBodyValue(newValue) {
        const { edit, bodyPos } = this.props;
        if(edit == bodyPos) {
            this.setState({ value: newValue });
        }
    }

    cancel() {
        const { body, edit, bodyPos, handleEdit } = this.props;
        if(edit == bodyPos) {
            if(body.value) {
                this.setState({ value: body.value });
            } else {
                this.setState({ value: null });
            }
            if(body.type) {
                this.setState({ type: body.type });
            };
            if(body.purpose) {
                this.setState({ purpose: body.purpose });
                switch(body.purpose) {
                    case 'describing':
                        this.setState({ purposeOptionState: 0 });
                        break;
                    case 'tagging':
                        this.setState({ purposeOptionState: 1 });
                        break;
                    default:
                        this.setState({ purposeOptionState: 0 });
                        break;
                }
            };
            handleEdit(null, 'body');
        }
    }

    delete() {
        const { bodyPos, handleDelete, edit } = this.props;
        if(edit == null) {
            handleDelete('body', bodyPos);
        }
    }

    render() {
        const { body, classes, t, windowId, edit, bodyPos } = this.props;
        const { value, purpose, type, purposeOptionState } = this.state;
        const purposeOptions = ['describing', 'tagging'];

        return (
            <ListItem divider className={classes.editAnnotationListItem}>
                <div>
                    <Grid container spacing={1}>
                        <Grid item xs={8}>
                            <ListItemText style={{ lineHeight: '1rem'}} primary={body.value ? ReactHtmlParser(body.value) : 'no text'} secondary={`${type} | ${purpose}`} />
                        </Grid>
                        <Grid item xs={4}>
                            <IconButton disabled={edit!==null && edit!==bodyPos} size="small" onClick={() => edit==bodyPos ? this.confirm() : this.edit()}>
                                {
                                    edit==bodyPos
                                    ? <Check />
                                    : <EditIcon />
                                }
                            </IconButton>
                            <IconButton disabled={edit!==null && edit!==bodyPos} size="small" onClick={() => edit==bodyPos ? this.cancel() : this.delete()}>
                                {
                                    edit==bodyPos
                                    ? <Cancel />
                                    : <DeleteIcon />
                                }
                            </IconButton>
                        </Grid>
                    </Grid>
                </div>
                <div className={classes.editAnnotation}>
                    <Collapse className={classes.editAnnotationCollapse} in={edit==bodyPos} unmountOnExit>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                            <FormControl>
                                    <InputLabel variant="standard" htmlFor='uncontrolled-native'>
                                        purpose
                                    </InputLabel>
                                    {/* maybe add a key */}
                                    <NativeSelect value={purposeOptions[purposeOptionState]} inputProps={{ name: 'metadata', id: 'uncontrolled-native' }} onChange={this.handleSelectedPurposeOption}>
                                        {purposeOptions.map((value, index) => (
                                            <option value={value}>{value}</option>
                                        ))}
                                    </NativeSelect>
                                </FormControl>
                                {
                                    purposeOptionState=="0"
                                    ? <AnnotationTextEditorItem key={`${body._temp_id}-TextEditorItem`} value={value} updateValue={this.updateBodyValue} windowId={windowId}  />
                                    : <AnnotationTextFieldItem key={`${body._temp_id}-TextFieldItem`} value={value} updateValue={this.updateBodyValue} windowId={windowId} />
                                }
                            </Grid>
                        </Grid>
                    </Collapse>
                </div>
            </ListItem>
        )
    }
}

AnnotationBodyItem.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string),
    body: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.string, type: PropTypes.string, purpose: PropTypes.string }),
    ),
    t: PropTypes.func.isRequired,
}

AnnotationBodyItem.defaultProps = {
    classes: {},
    body: {},
    t: key => key,
}

export default AnnotationBodyItem;
