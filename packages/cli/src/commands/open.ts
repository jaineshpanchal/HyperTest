import pc from 'picocolors';
import { startArtifactsServer } from '../util/server.js';

export async function open() {
  const port = Number(process.env.HYPERTEST_PORT || 4321);
  startArtifactsServer({ artifactsDir: 'artifacts', port });
  console.log(pc.green(`\n✔ Serving artifacts on http://localhost:${port}`));
  console.log(pc.cyan('Tip: In the dashboard, click "Load latest" to fetch /latest\n'));
}
