import pc from 'picocolors';

export async function verify() {
  console.log(pc.yellow('ℹ Verifying: typecheck + lint (delegated to workspace scripts).'));
}
