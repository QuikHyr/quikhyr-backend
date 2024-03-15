import { firestore } from "firebase-admin";

export default class Client {
  constructor(
    public id: string,
    public name: string,
    public age: number,
    public image: string,
    public email: string,
    public phone: string,
    public gender: string,
    public address: string,
    public pincode: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromFirestore(doc: firestore.DocumentSnapshot): Client {
    const data = doc?.data();
    return new Client(
      doc?.id,
      data?.name,
      data?.age,
      data?.image,
      data?.email,
      data?.phone,
      data?.gender,
      data?.address,
      data?.pincode,
      data?.createdAt,
      data?.updatedAt
    );
  }
}
