import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Check } from '@material-ui/icons';
import EditIcon from '@material-ui/icons/Edit';
import MetadataCreatorItem from '../containers/MetadataCreatorItem';
import MetadataMotivationItem from '../containers/MetadataMotivationItem';
import CustomListItem from '../containers/CustomListItem';
import MiradorMenuButton from 'mirador/dist/es/src/containers/MiradorMenuButton';

// you still have a lot of work to do

class AnnotationMetadataItem extends Component {
    constructor(props) {
        super(props);

        this.edit = this.edit.bind(this);
        this.editing = this.editing.bind(this);
        this.confirm = this.confirm.bind(this);
        this.delete = this.delete.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        const {
            handleEdit,
            metadata,
        } = this.props;

        /*if(!metadata.value) {
            handleEdit(metadata._temp_id, 'metadata');
        }*/
    }

    edit() {
        const {
            handleEdit,
            metadata,
        } = this.props;

        handleEdit(metadata._temp_id, 'metadata');
    }

    confirm() {
        const { handleEdit } = this.props;

        handleEdit(null, 'metadata');
    }

    handleChange( newValue ) {
        const {
            metadata,
            updateContent,
        } = this.props;

        updateContent('metadata', { value: newValue, type: metadata.type, _temp_id: metadata._temp_id }, metadata._temp_id);
    }

    delete() {
        const {
            handleDelete,
            metadata,
        } = this.props;

        handleDelete('metadata', metadata._temp_id);
    }

    editing() {
        const {
            edit,
            metadata,
        } = this.props;

        return metadata._temp_id == edit;
    }

    renderCreator() {
        const { metadata } = this.props;
        const edit = this.editing();

        return (
            {
                primary: metadata.type,
                secondary:  edit
                    ? (
                        <MetadataCreatorItem
                            id={`${metadata}-creator`}
                            value={metadata.value}
                            handleChange={this.handleChange}
                        />
                    )
                    : ( metadata.value ? metadata.value : '' )
            }
        )
    }

    renderMotivation() {
        const { metadata } = this.props;
        const edit = this.editing();

        return (
            {
                primary: metadata.type,
                secondary: edit
                    ? (
                        <MetadataMotivationItem
                            value={metadata.value}
                            handleChange={this.handleChange}
                        />
                    )
                    : ( metadata.value ? metadata.value : '' )
            }
        )
    }

    render() {
        const {
            classes,
            metadata,
            t,
        } = this.props;
        const edit = this.editing();

        return (
            <>
                {
                    metadata.type !== 'creator'
                    ? null
                    : (
                        <CustomListItem
                            buttons={
                                <MiradorMenuButton aria-label={edit ? t('editMetadataButton') : t('confirmMetadataButton')} size="small" onClick={() => edit ? this.confirm() : this.edit()}>
                                    {
                                        edit
                                        ? <Check />
                                        : <EditIcon />
                                    }
                                </MiradorMenuButton>
                            }
                            {...(() => {
                                switch(metadata.type) {
                                    case 'creator':
                                        return this.renderCreator();
                                    case 'motivation':
                                        return this.renderMotivation();
                                    default:
                                        return null;
                                }
                            })()}
                        />
                    )
                }
            </>
        )
    }
}

AnnotationMetadataItem.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string),
    metadata: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.string, type: PropTypes.string }),
    ),
    t: PropTypes.func.isRequired,
}

AnnotationMetadataItem.defaultProps = {
    classes: {},
    metadata: {},
    t: key => key,
}

export default AnnotationMetadataItem;
