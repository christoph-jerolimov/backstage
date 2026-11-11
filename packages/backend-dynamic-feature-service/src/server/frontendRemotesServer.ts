/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { addHttp2StaticAssets } from '@backstage/backend-defaults/alpha';
import { createRouter } from './router';
import { dynamicPluginsServiceRef } from '../manager/plugin-manager';
import { spec } from '../schema/openapi/generated';
import { ManifestFileName } from '@module-federation/sdk';
import { RemoteInfo } from '../schema/openapi/generated/models';
import { JsonObject } from '@backstage/types';

/**
 *
 * @public
 * */
export type AdditionalRemoteInfo = Omit<RemoteInfo, 'name' | 'entry'>;

/**
 *
 * @public
 * */
export type FrontendRemoteResolver = {
  /**
   * Relative path to the module federation assets folder from the root folder of the plugin package.
   * Default value is `dist`.
   */
  assetsPathFromPackage?: string;

  /**
   * File name of the module federation manifest inside the module federation assets folder.
   * Default value is `mf-manifest.json`.
   */
  manifestFileName?: string;

  /**
   * Type of the remote entry returned in the RemoteInfo for this remote.
   * Default value is `manifest`.
   */
  getRemoteEntryType?: (
    manifestContent: JsonObject,
  ) => 'manifest' | 'javascript';

  /**
   * Additional module federation fields, which might be required if the remote entry type is 'javascript'.
   */
  getAdditionalRemoteInfo?: (
    manifestContent: JsonObject,
  ) => AdditionalRemoteInfo;

  /**
   * Additional module federation fields, which might be required if the remote entry type is 'javascript'.
   * @deprecated Use `getAdditionalRemoteInfo` instead.
   */
  getAdditionaRemoteInfo?: (
    manifestContent: JsonObject,
  ) => AdditionalRemoteInfo;

  /**
   * Overrides the list of exposed modules. By default the exposed modules are read from the manifest file.
   */
  overrideExposedModules?: (
    exposedModules: string[],
    manifestContent: JsonObject,
  ) => string[];

  /**
   * Customizes the manifest before returning it as the remote entry.
   */
  customizeManifest?: (content: JsonObject) => JsonObject;
};

/**
 *
 * @public
 * */
export type FrontendRemoteResolverProvider = {
  for(
    pluginName: string,
    pluginPackagePath: string,
  ): Partial<FrontendRemoteResolver> | undefined;
};

/**
 *
 * @public
 * */
export interface DynamicPluginsFrontendRemotesService {
  setResolverProvider(provider: FrontendRemoteResolverProvider): void;
}

/**
 * A service that serves the frontend module federation remotes,
 * and allows a plugin to customize the way remotes are served,
 * by setting a ResolverProvider.
 *
 * @public
 */
export const dynamicPluginsFrontendServiceRef =
  createServiceRef<DynamicPluginsFrontendRemotesService>({
    id: 'core.dynamicplugins.frontendRemotes',
    scope: 'root',
  });

export type FrontendRemoteResolvers = {
  default: FrontendRemoteResolver &
    Required<
      Pick<
        FrontendRemoteResolver,
        'assetsPathFromPackage' | 'manifestFileName' | 'getRemoteEntryType'
      >
    >;
  provider?: FrontendRemoteResolverProvider;
};

/**
 * Reads whether the frontend assets of dynamic plugins should be served
 * directly by the built-in HTTP/2 server, and which plugins to leave out.
 */
function readHttp2FrontendAssetsConfig(config: RootConfigService): {
  enabled: boolean;
  exclude: Set<string>;
} {
  const key = 'dynamicPlugins.http2FrontendAssets';
  const value = config.getOptional(key);
  if (value === undefined || value === false) {
    return { enabled: false, exclude: new Set() };
  }
  if (value === true) {
    return { enabled: true, exclude: new Set() };
  }
  const assetsConfig = config.getConfig(key);
  return {
    enabled: assetsConfig.getOptionalBoolean('enabled') ?? true,
    exclude: new Set(assetsConfig.getOptionalStringArray('exclude') ?? []),
  };
}

export const frontendRemotesServerService = createServiceFactory({
  service: dynamicPluginsFrontendServiceRef,
  deps: {
    logger: coreServices.rootLogger,
    rootHttpRouter: coreServices.rootHttpRouter,
    config: coreServices.rootConfig,
    dynamicPlugins: dynamicPluginsServiceRef,
    lifecycle: coreServices.rootLifecycle,
  },
  async factory({ logger, rootHttpRouter, config, dynamicPlugins, lifecycle }) {
    const resolvers: FrontendRemoteResolvers = {
      default: {
        assetsPathFromPackage: 'dist',
        manifestFileName: ManifestFileName,
        getRemoteEntryType: () => 'manifest',
      },
      provider: undefined,
    };

    const http2Assets = readHttp2FrontendAssetsConfig(config);

    lifecycle.addStartupHook(async () => {
      const basePath = `/${spec.info.title}`;
      rootHttpRouter.use(
        basePath,
        await createRouter({
          logger,
          config,
          dynamicPlugins,
          resolvers,
          onFrontendAssets: http2Assets.enabled
            ? ({ pluginName, path, directory }) => {
                if (http2Assets.exclude.has(pluginName)) {
                  logger.info(
                    `Not serving the frontend assets of dynamic plugin '${pluginName}' directly over HTTP/2, since it is excluded`,
                  );
                  return;
                }
                const added = addHttp2StaticAssets(rootHttpRouter, {
                  path: `${basePath}${path}`,
                  directory,
                });
                if (!added) {
                  logger.warn(
                    `Not serving the frontend assets of dynamic plugin '${pluginName}' directly over HTTP/2, since the backend isn't serving HTTP/2. Enable it with backend.http2.`,
                  );
                }
              }
            : undefined,
        }),
      );
    });

    return {
      setResolverProvider(resolver) {
        logger.info('Setting resolver provider');
        if (resolvers.provider) {
          throw new Error(
            'Attempted to install a frontend remote resolver provider twice',
          );
        }
        resolvers.provider = resolver;
      },
    };
  },
});
