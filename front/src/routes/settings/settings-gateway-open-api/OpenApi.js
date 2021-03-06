import { Text, Localizer } from 'preact-i18n';

import OpenApiKey from './OpenApiKey';

const OpenApi = ({ children, ...props }) => (
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">
        <Text id="gatewayOpenApi.title" />
      </h3>
    </div>
    <div class="card-body">
      <p>
        <Text id="gatewayOpenApi.description" />{' '}
        <a href="https://documentation.gladysassistant.com/en/configuration#gateway-open-api">
          <Text id="gatewayOpenApi.moreInformations" />
        </a>
      </p>
      <p>
        <Text id="gatewayOpenApi.warningKeyDisappear" />
      </p>
    </div>
    <div>
      <div class="table-responsive">
        <table class="table table-hover table-outline table-vcenter text-nowrap card-table">
          <thead>
            <tr>
              <th>
                <Text id="gatewayOpenApi.keyName" />
              </th>
              <th>
                <Text id="gatewayOpenApi.keyLastUsed" />
              </th>
              <th class="w-1">
                <Text id="gatewayOpenApi.revoke" />
              </th>
            </tr>
          </thead>
          <tbody>
            {props.apiKeys &&
              props.apiKeys.map((apiKey, index) => (
                <OpenApiKey apiKey={apiKey} revokeOpenApiKey={props.revokeOpenApiKey} index={index} />
              ))}

            <tr>
              <td>
                <Localizer>
                  <input
                    type="text"
                    class={'form-control ' + (props.missingNewOpenApiName ? 'is-invalid' : '')}
                    value={props.newApiKeyName}
                    onChange={props.updateNewApiKeyName}
                    placeholder={<Text id="gatewayOpenApi.keyName" />}
                  />
                </Localizer>
              </td>
              <td>
                <button class="btn btn-primary" onClick={props.createApiKey}>
                  <Text id="gatewayOpenApi.generateButton" />
                </button>
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default OpenApi;
