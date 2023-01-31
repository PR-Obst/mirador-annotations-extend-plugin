import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import RectangleIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CircleIcon from '@material-ui/icons/RadioButtonUnchecked';
import PolygonIcon from '@material-ui/icons/Timeline';
import GestureIcon from '@material-ui/icons/Gesture';
import ClosedPolygonIcon from '@material-ui/icons/ChangeHistory';
import OpenPolygonIcon from '@material-ui/icons/ShowChart';
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import StrokeColorIcon from '@material-ui/icons/BorderColor';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import FormatShapesIcon from '@material-ui/icons/FormatShapes';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import { TextField } from '@material-ui/core';
import { ExpandMore, ExpandLess } from '@material-ui/icons';
import { Collapse } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { SketchPicker } from 'react-color';
import { v4 as uuid } from 'uuid';
import CompanionWindow from 'mirador/dist/es/src/containers/CompanionWindow';
import CollapsibleSection from 'mirador/dist/es/src/containers/CollapsibleSection';
import AnnotationDrawing from './AnnotationDrawing';
import TextEditor from '../containers/TextEditor';
import WebAnnotation from '../WebAnnotation';
import CursorIcon from '../icons/Cursor';
import { Check } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import ns from 'mirador/dist/es/src/config/css-ns';
import AnnotationBodyItem from '../containers/AnnotationBodyItem';
import AnnotationMetadataItem from '../containers/AnnotationMetadataItem';
import AnnotationTargetItem from '../containers/AnnotationTargetItem';

/** */
class AnnotationCreation extends Component {
    /** */
    constructor(props) {
        super(props);
        const annoState = {};
        if (props.annotation) {
            if(props.annotation.id) {
                annoState.annoId = props.annotation.id;
            };
            if (Array.isArray(props.annotation.body)) {
                annoState.tags = [];
                props.annotation.body.forEach((body) => {
                    if (body.purpose === 'tagging') {
                        annoState.tags.push(body.value);
                    } else {
                        annoState.annoBody = body.value;
                    }
                });
            } else {
                annoState.annoBody = props.annotation.body.value;
            }
            if (props.annotation.target.selector) {
                if (Array.isArray(props.annotation.target.selector)) {
                    props.annotation.target.selector.forEach((selector) => {
                        if (selector.type === 'SvgSelector') {
                            annoState.svg = selector.value;
                        } else if (selector.type === 'FragmentSelector') {
                            annoState.xywh = selector.value.replace('xywh=', '');
                        }
                    });
                } else {
                    annoState.svg = props.annotation.target.selector.value;
                }
            }
        }

        const toolState = {
            activeTool: 'cursor',
            closedMode: 'closed',
            currentColorType: false,
            fillColor: null,
            strokeColor: '#00BFFF',
            strokeWidth: 3,
            ...(props.config.annotation.defaults || {}),
        };

        const testDataState = [
            {
                id: 'body1',
                value: '<p>dummi 1</p>',
                type: 'TextualBody',
                purpose: 'describing'
            },
            {
                id: 'body2',
                value: '<p>two Cherries</p>',
                type: 'TextualBody',
                purpose: 'describing'
            },
            {
                id: 'body3',
                value: '<p>Tick, Trick & Paul</p>',
                type: 'TextualBody',
                purpose: 'describing'
            },
            {
                id: 'body4',
                value: '<p>Ḿay the fourth</p>',
                type: 'TextualBody',
                purpose: 'describing'
            },
            {
                id: 'body5',
                value: '<p>Mambo number 5</p>',
                type: 'TextualBody',
                purpose: 'describing'
            }
        ];

        const testMetadataState = [
            {
                value: 'Thomas Bär',
                type: 'creator'
            },
            {
                value: 'commenting',
                type: 'motivation'
            }
        ];

        const testSelectorState = [
            {
                value: 'xywh=20,20,40,40',
                type: 'FragmentSelector'
            }
        ];


        this.state = {
            ...toolState,
            annoBody: '',
            annoId: null,
            colorPopoverOpen: false,
            lineWeightPopoverOpen: false,
            targetListOpen: false,
            bodyListOpen: false,
            popoverAnchorEl: null,
            popoverLineWeightAnchorEl: null,
            creatorEdit: false,
            svg: null,
            textEditorStateBustingKey: 0,
            xywh: null,
            testDataState,
            testMetadataState,
            testSelectorState,
            ...annoState,
        };

        this.submitForm = this.submitForm.bind(this);
        this.updateBody = this.updateBody.bind(this);
        this.updateGeometry = this.updateGeometry.bind(this);
        this.changeTool = this.changeTool.bind(this);
        this.changeClosedMode = this.changeClosedMode.bind(this);
        this.openChooseColor = this.openChooseColor.bind(this);
        this.openChooseLineWeight = this.openChooseLineWeight.bind(this);
        this.handleLineWeightSelect = this.handleLineWeightSelect.bind(this);
        this.handleCloseLineWeight = this.handleCloseLineWeight.bind(this);
        this.closeChooseColor = this.closeChooseColor.bind(this);
        this.updateStrokeColor = this.updateStrokeColor.bind(this);
        this.deleteAnnotationItem = this.deleteAnnotationItem.bind(this);
        this.updateAnnotationItem = this.updateAnnotationItem.bind(this);
    }

    /** */
    handleCloseLineWeight(e) {
        this.setState({
            lineWeightPopoverOpen: false,
            popoverLineWeightAnchorEl: null,
        });
    }

    deleteAnnotationItem(type, pos) {
        const { testDataState, testMetadataState, testSelectorState } = this.state;
        console.log('i have fun doing shit');
        console.log(type);
        console.log(pos);
        switch(type) {
            case "target":
                var newData = testSelectorState;
                newData.splice(pos, 1);
                this.setState({ testSelectorState: newData });
                break;
            case "metadata":
                var newData = testMetadataState;
                newData.splice(pos, 1);
                this.setState({ testmetaDataState: newData });
                break;
            case "body":
                var newData = testDataState;
                newData.splice(pos, 1);
                this.setState({ testDataState: newData });
                break;
            default:
                break;
        }
    }

    updateAnnotationItem(type, content, pos) {
        const { testDataState, testMetadataState, testSelectorState } = this.state;
        console.log('i really have fun doing shit');
        console.log(type);
        console.log(content);
        console.log(pos);
        switch(type) {
            case "target":
                //var newData = testSelectorState;
                //newData[pos] = content;
                //this.setState({ testSelectorState: newData });
                break;
            case "metadata":
                //var newData = testMetadataState;
                //newData[pos] = content;
                //this.setState({ testmetaDataState: newData });
                break;
            case "body":
                //var newData = testDataState;
                //newData[pos] = content;
                this.setState({ testDataState: update(testDataState, {pos: newData })});
                break;
            default:
                break;
        }
    }

    /** */
    handleLineWeightSelect(e) {
        this.setState({
            lineWeightPopoverOpen: false,
            popoverLineWeightAnchorEl: null,
            strokeWidth: e.currentTarget.value,
        });
    }

    /** */
    openChooseColor(e) {
        this.setState({
            colorPopoverOpen: true,
            currentColorType: e.currentTarget.value,
            popoverAnchorEl: e.currentTarget,
        });
    }

    /** */
    openChooseLineWeight(e) {
        this.setState({
            lineWeightPopoverOpen: true,
            popoverLineWeightAnchorEl: e.currentTarget,
        });
    }

    /** */
    closeChooseColor(e) {
        this.setState({
            colorPopoverOpen: false,
            currentColorType: null,
            popoverAnchorEl: null,
        });
    }

    /** */
    updateStrokeColor(color) {
        const { currentColorType } = this.state;
        this.setState({
            [currentColorType]: color.hex,
        });
    }

    /** */
    submitForm(e) {
        e.preventDefault();
        const {
            annotation, canvases, receiveAnnotation, config,
        } = this.props;
        const {
            annoBody, tags, xywh, svg, textEditorStateBustingKey,
        } = this.state;
        canvases.forEach((canvas) => {
            const storageAdapter = config.annotation.adapter(canvas.id);
            const anno = new WebAnnotation({
                body: annoBody,
                canvasId: canvas.id,
                id: (annotation && annotation.id) || `${uuid()}`,
                manifestId: canvas.options.resource.id,
                svg,
                tags,
                xywh,
            }).toJson();
            if (annotation) {
                storageAdapter.update(anno).then((annoPage) => {
                    receiveAnnotation(canvas.id, storageAdapter.annotationPageId, annoPage);
                });
            } else {
                storageAdapter.create(anno).then((annoPage) => {
                    receiveAnnotation(canvas.id, storageAdapter.annotationPageId, annoPage);
                });
            }
        });

        this.setState({
            annoBody: '',
            svg: null,
            textEditorStateBustingKey: textEditorStateBustingKey + 1,
            xywh: null,
        });
    }

    /** */
    changeTool(e, tool) {
        this.setState({
            activeTool: tool,
        });
    }

    /** */
    changeClosedMode(e) {
        this.setState({
            closedMode: e.currentTarget.value,
        });
    }

    /** */
    updateBody(annoBody) {
        this.setState({ annoBody });
    }

    /** */
    updateGeometry({ svg, xywh }) {
        console.log('i update geo');
        console.log(svg);
        console.log(xywh);
        this.setState({
            svg, xywh,
        });
    }

    /** */
    render() {
        const {
            annotation, classes, closeCompanionWindow, id, windowId, t
        } = this.props;

        const {
            activeTool, colorPopoverOpen, currentColorType, fillColor, popoverAnchorEl, strokeColor,
            popoverLineWeightAnchorEl, lineWeightPopoverOpen, strokeWidth, closedMode, annoBody, svg,
            textEditorStateBustingKey, targetListOpen, bodyListOpen, creatorEdit, testDataState, testMetadataState, testSelectorState, annoId
        } = this.state;
        console.log('this is anno - id');
        console.log(annoId);
        return (
            <CompanionWindow
                title={annotation ? t('editAnnotation') : t('addAnnotation')}
                windowId={windowId}
                id={id}
                paperClassName={ns('window-sidebar-annotation-panel')}
            >

                {/* metadata testing section */}
                <div className={classes.section}>
                    <CollapsibleSection id={`${id}-metadata`} label={t('metadata')}>
                        <List disablePadding>
                            {testMetadataState.map((value, index) => (
                                <AnnotationMetadataItem metadata={value} metadataPos={index} handleDelete={this.deleteAnnotationItem} handleSubmit={this.updateAnnotationItem} />
                            ))}
                        </List>
                    </CollapsibleSection>
                </div>

                {/* target testing section */}
                <div className={classes.section}>
                    <CollapsibleSection id={`${id}-targets`} label="Targets">
                        <List disablePadding>
                            {testSelectorState.map((value, index) => (
                                <AnnotationTargetItem selector={value} targetPos={index} handleDelete={this.deleteAnnotationItem} handleSubmit={this.updateAnnotationItem} />
                            ))}
                        </List>
                    </CollapsibleSection>
                </div>

                {/* testing body section */}
                <div className={classes.section}>
                    <CollapsibleSection id={`${id}-bodies`} label="Bodies">
                        <List component="div" disablePadding>
                            {testDataState.map((value, index) => (
                                <AnnotationBodyItem body={value} bodyPos={index} handleDelete={this.deleteAnnotationItem} handleSubmit={this.updateAnnotationItem} />

                            ))}
                        </List>
                    </CollapsibleSection>
                </div>

                <AnnotationDrawing
                    activeTool={activeTool}
                    fillColor={fillColor}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    closed={closedMode === 'closed'}
                    svg={svg}
                    updateGeometry={this.updateGeometry}
                    windowId={windowId}
                />
                <form onSubmit={this.submitForm} className={classes.section}>
                    {/*
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant="overline">
                                {t('annotationPanelLabelTarget')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={0} className={classes.paper}>
                                <ToggleButtonGroup
                                    className={classes.grouped}
                                    value={activeTool}
                                    exclusive
                                    onChange={this.changeTool}
                                    aria-label={t('annotationPanelToolSelection')}
                                    size="small"
                                >
                                    <ToggleButton value="cursor" aria-label={t('annotationPanelCursorSelect')} >
                                        <CursorIcon />
                                    </ToggleButton>
                                    <ToggleButton value="edit" aria-label={t('annotationPanelCursorSelect')} >
                                        <FormatShapesIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant="overline">
                                {t('annotationPanelLabelContent')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextEditor
                                key={textEditorStateBustingKey}
                                annoHtml={annoBody}
                                updateAnnotationBody={this.updateBody}
                            />
                        </Grid>
            </Grid>*/}
                    <Button onClick={closeCompanionWindow}>
                        {t('annotationPanelCancel')}
                    </Button>
                    <Button variant="contained" color="primary" type="submit">
                        {t('annotationPanelSubmit')}
                    </Button>
                </form>
                <Popover
                    open={lineWeightPopoverOpen}
                    anchorEl={popoverLineWeightAnchorEl}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={this.handleCloseLineWeight}>
                            <MenuList autoFocus role="listbox">
                                {[1, 3, 5, 10, 50].map((option, index) => (
                                    <MenuItem
                                        key={option}
                                        onClick={this.handleLineWeightSelect}
                                        value={option}
                                        selected={option == strokeWidth}
                                        role="option"
                                        aria-selected={option == strokeWidth}
                                    >
                                        {option}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Popover>
                <Popover
                    open={colorPopoverOpen}
                    anchorEl={popoverAnchorEl}
                    onClose={this.closeChooseColor}
                >
                    <SketchPicker
                        // eslint-disable-next-line react/destructuring-assignment
                        color={this.state[currentColorType] || {}}
                        onChangeComplete={this.updateStrokeColor}
                    />
                </Popover>
            </CompanionWindow>
        );
    }
}

AnnotationCreation.propTypes = {
    annotation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    canvases: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
    ),
    classes: PropTypes.objectOf(PropTypes.string),
    closeCompanionWindow: PropTypes.func,
    config: PropTypes.shape({
        annotation: PropTypes.shape({
            adapter: PropTypes.func,
            defaults: PropTypes.objectOf(
                PropTypes.oneOfType(
                    [PropTypes.bool, PropTypes.func, PropTypes.number, PropTypes.string]
                )
            ),
        }),
    }).isRequired,
    id: PropTypes.string.isRequired,
    receiveAnnotation: PropTypes.func.isRequired,
    windowId: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
};

AnnotationCreation.defaultProps = {
    annotation: null,
    canvases: [],
    classes: {},
    closeCompanionWindow: () => { },
    t: key => key,
};

export default AnnotationCreation;
