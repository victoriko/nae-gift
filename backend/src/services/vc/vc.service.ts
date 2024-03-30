import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';
import { StatusMethod, StatusEntry } from 'credential-status';

@Injectable()
export class VcService {
  async veramoImport() {
    const { createAgent } = (await dynamicImport(
      '@veramo/core',
      module,
    )) as typeof import('@veramo/core');
    const { DIDManager } = (await dynamicImport(
      '@veramo/did-manager',
      module,
    )) as typeof import('@veramo/did-manager');
    const { EthrDIDProvider } = (await dynamicImport(
      '@veramo/did-provider-ethr',
      module,
    )) as typeof import('@veramo/did-provider-ethr');
    const { KeyManager } = (await dynamicImport(
      '@veramo/key-manager',
      module,
    )) as typeof import('@veramo/key-manager');
    const { KeyManagementSystem, SecretBox } = (await dynamicImport(
      '@veramo/kms-local',
      module,
    )) as typeof import('@veramo/kms-local');
    const { CredentialPlugin } = (await dynamicImport(
      '@veramo/credential-w3c',
      module,
    )) as typeof import('@veramo/credential-w3c');
    const { DIDResolverPlugin } = (await dynamicImport(
      '@veramo/did-resolver',
      module,
    )) as typeof import('@veramo/did-resolver');
    const { Resolver } = (await dynamicImport(
      'did-resolver',
      module,
    )) as typeof import('did-resolver');
    const { Entities, DIDStore, KeyStore, PrivateKeyStore, migrations } =
      (await dynamicImport(
        '@veramo/data-store',
        module,
      )) as typeof import('@veramo/data-store');
    const { CredentialIssuerEIP712 } = (await dynamicImport(
      '@veramo/credential-eip712',
      module,
    )) as typeof import('@veramo/credential-eip712');
    const { CredentialStatusPlugin } = (await dynamicImport(
      '@veramo/credential-status',
      module,
    )) as typeof import('@veramo/credential-status');

    return {
      createAgent,
      DIDManager,
      EthrDIDProvider,
      KeyManager,
      KeyManagementSystem,
      SecretBox,
      CredentialPlugin,
      DIDResolverPlugin,
      Resolver,
      Entities,
      DIDStore,
      KeyStore,
      PrivateKeyStore,
      migrations,
      CredentialIssuerEIP712,
      CredentialStatusPlugin,
    };
  }

  async getAgent() {
    const {
      createAgent,
      DIDManager,
      EthrDIDProvider,
      KeyManager,
      KeyManagementSystem,
      SecretBox,
      CredentialPlugin,
      DIDResolverPlugin,
      Resolver,
      Entities,
      DIDStore,
      KeyStore,
      PrivateKeyStore,
      migrations,
      CredentialIssuerEIP712,
      CredentialStatusPlugin,
    } = await this.veramoImport();

    const DATABASE_FILE = 'database.sqlite';

    const dbConnection = new DataSource({
      type: 'sqlite',
      database: DATABASE_FILE,
      synchronize: false,
      migrations,
      migrationsRun: true,
      logging: ['error', 'info', 'warn'],
      entities: Entities,
    }).initialize();

    const statusMethod: StatusMethod = async (credential: {
      credentialStatus?: StatusEntry;
    }) => {
      const response = await fetch(credential.credentialStatus.id, {
        method: 'get',
      });
      const revoked = await response.json();

      return { revoked };
    };

    const agent = createAgent({
      plugins: [
        new KeyManager({
          store: new KeyStore(dbConnection),
          kms: {
            local: new KeyManagementSystem(
              new PrivateKeyStore(
                dbConnection,
                new SecretBox(process.env.KMS_SECRET_KEY),
              ),
            ),
          },
        }),
        new DIDManager({
          store: new DIDStore(dbConnection),
          defaultProvider: 'did:ethr:sepolia',
          providers: {
            'did:ethr:sepolia': new EthrDIDProvider({
              defaultKms: 'local',
              network: 'sepolia',
              rpcUrl: process.env.INFURA + '/' + process.env.INFURA_PROJECT_ID,
            }),
            'did:web': new EthrDIDProvider({
              defaultKms: 'local',
            }),
          },
        }),
        new CredentialPlugin(),
        new CredentialIssuerEIP712(),
        new CredentialStatusPlugin({ StatusList2021Entry: statusMethod }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...ethrDidResolver({
              infuraProjectId: process.env.INFURA_PROJECT_ID,
            }),
            ...webDidResolver(),
          }),
        }),
      ],
    });

    return agent;
  }
}
