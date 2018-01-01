import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Input from 'material-ui/TextField';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import deviceApi from '../services/deviceApi';
import deviceStatus from '../services/deviceStatus';

const styles = () => ({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  item: {
    textAlign: 'center',
  },
  input: {
    marginBottom: '10px',
    textAlign: 'left',
  },
  button: {
    marginTop: '10px',
    width: '100%',
  },
});

class Register extends React.Component {
  constructor() {
    super();
    this.state = {
      macAddress: '',
      password: '',
      networks: [],
      isRegistering: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentWillMount() {
    if (await deviceStatus.isRegistered()) {
      this.props.history.replace('/');
    } else {
      deviceApi.get('/networks')
        .then(res => this.setState({ networks: res.data }))
        .catch(err => console.error(err));
    }
  }

  onSubmit() {
    const {
      networks,
      macAddress,
      password,
    } = this.state;
    const network = _.find(networks, { mac: macAddress });

    if (_.isEmpty(network.ssid) || _.isEmpty(password)) {
      // TODO: error message
      return;
    }

    this.setState({ isRegistering: true });
    deviceApi.post('/networks', { ssid: network.ssid, password })
      .then(() => {
        this.setState({ isRegistering: false });
        this.props.history.replace('/');
      })
      .catch((err) => {
        this.setState({ isRegistering: false });
        console.error(err);
      });
  }

  handleNetworkSelect(macAddress) {
    this.setState({ macAddress });
  }

  renderSelectOptions() {
    return this.state.networks.map(network => (
      <MenuItem key={network.mac} value={network.mac}>{network.ssid}</MenuItem>
    ));
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container className={classes.root}>
        <Grid item className={classes.item}>
          <h1>Smarter Bham Project</h1>
          <Select
            fullWidth
            displayEmpty
            className={classes.input}
            value={this.state.macAddress}
            onChange={event => this.handleNetworkSelect(event.target.value)}
            disabled={this.state.isRegistering}
          >
            <MenuItem value="">
              <em>Select WiFi Network</em>
            </MenuItem>
            {this.renderSelectOptions()}
          </Select>
          <Input
            fullWidth
            type="password"
            label="WiFi Password"
            className={classes.input}
            value={this.state.password}
            onChange={event => this.setState({ password: event.target.value })}
            disabled={this.state.isRegistering}
          />
          <Button
            raised
            color="primary"
            className={classes.button}
            onClick={this.onSubmit}
            disabled={this.state.isRegistering}
          >
            {this.state.isRegistering ? 'Connecting to WiFi...' : 'Register Device'}
          </Button>
        </Grid>
      </Grid>
    );
  }
}

Register.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(Register);
