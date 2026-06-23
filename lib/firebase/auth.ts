import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { auth } from './client';

export const signInWithEmail = (email: string, pass: string) =>
  signInWithEmailAndPassword(auth, email, pass);

export const signInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result;
};

export const signOut = () => firebaseSignOut(auth);

export const sendVerificationEmail = (user: User) => sendEmailVerification(user);

export const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);

export const updateUserPassword = (user: User, newPassword: string) => updatePassword(user, newPassword);

export const enrollMFA = async (user: User): Promise<TotpSecret> => {
  const multiFactorSession = await multiFactor(user).getSession();
  return TotpMultiFactorGenerator.generateSecret(multiFactorSession);
};

export const verifyMFA = async (
  user: User,
  secret: TotpSecret,
  verificationCode: string,
  mfaDisplayName: string
) => {
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, verificationCode);
  await multiFactor(user).enroll(assertion, mfaDisplayName);
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
