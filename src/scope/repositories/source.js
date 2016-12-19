/** @flow */
import * as path from 'path';
import Repository from '../repository';
import { BIT_SOURCES_DIRNAME } from '../../constants';
import InvalidBit from '../../bit/exceptions/invalid-bit';
import Bit from '../../bit';
import ParitalBit from '../../bit/partial-bit';
import BitId from '../../bit-id';
import { listDirectories } from '../../utils';

export default class Source extends Repository {
  getPath(): string {
    return path.join(super.getPath(), BIT_SOURCES_DIRNAME);
  }

  getBitPath(bitName: string) {
    return path.join(this.getPath(), bitName);
  }  

  getPartial(name: string): Promise<ParitalBit> {
    return ParitalBit.load(name, path.join(this.getPath(), name));
  }

  setSource(bit: Bit): Promise<Bit> {
    if (!bit.validate()) throw new InvalidBit();

    return bit
      .cd(this.composeSourcePath(bit.getId()))
      .write()
      .then(() => bit);
  }

  listVersions(bitId: BitId): number[] {
    return listDirectories(this.composeVersionsPath(bitId.name, bitId.box))
      .map(version => parseInt(version));
  }

  loadSource(id: BitId, version: number) {
    return Bit.load(id.name, this.composeSourcePath({
      name: id.name,
      box: id.box,
      version
    }));
  }

  composeVersionsPath(name: string, box: string) {
    return path.join(this.getPath(), box, name);
  }

  composeSourcePath({ name, box = 'global', version }: {name: string, box?: string, version: number }) {
    return path.join(this.getPath(), box, name, version.toString());
  }
}