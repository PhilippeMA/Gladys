import { Text } from 'preact-i18n';
import cx from 'classnames';

import EmptyState from './EmptyState';
import style from './style.css';
import W215DeviceBox from '../W215DeviceBox';

const DiscoverTab = ({ children, ...props }) => (
  <div class="card">
    <div class="card-header">
      <h1 class="card-title">
        <Text id="integration.w215.discover.title" />
      </h1>
      <div class="page-options d-flex">
        <button onClick={props.getDiscoveredW215Devices} class="btn btn-outline-primary ml-2" disabled={props.loading}>
          <Text id="integration.w215.discover.scan" /> <i class="fe fe-radio" />
        </button>
      </div>
    </div>
    <div class="card-body">
      <div class="alert alert-secondary">
        <Text id="integration.w215.discover.description" />
      </div>
      <div
        class={cx('dimmer', {
          active: props.loading
        })}
      >
        <div class="loader" />
        <div class={cx('dimmer-content', style.w215ListBody)}>
          {props.errorLoading && (
            <p class="alert alert-danger">
              <Text id="integration.w215.discover.error" />
            </p>
          )}
          <div class="row">
            {props.discoveredDevices &&
              props.discoveredDevices.map((w215Device, index) => (
                <W215DeviceBox
                  {...props}
                  editable={!w215Device.created_at || w215Device.updatable}
                  alreadyCreatedButton={w215Device.created_at && !w215Device.updatable}
                  updateButton={w215Device.updatable}
                  saveButton={!w215Device.created_at}
                  w215Device={w215Device}
                  deviceIndex={index}
                  listName="discoveredDevices"
                />
              ))}
            {!props.discoveredDevices || (props.discoveredDevices.length === 0 && <EmptyState />)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DiscoverTab;