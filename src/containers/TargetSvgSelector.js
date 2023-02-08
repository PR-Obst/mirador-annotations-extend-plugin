import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import TargetSvgSelector from '../components/TargetSvgSelector';


const styles = (theme) => ({
    selector: {},
    hidden: {
        display: 'none',
    }
});

const enhance = compose(
    withTranslation(),
    withStyles(styles),
);

export default enhance(TargetSvgSelector);
