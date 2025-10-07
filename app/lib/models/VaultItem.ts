import mongoose, { Schema, Document } from 'mongoose';

export interface IVaultItem extends Document {
  owner: mongoose.Types.ObjectId;
  ciphertext: string;
  iv: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ciphertext: { type: String, required: true },
  iv: { type: String, required: true },
  salt: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);