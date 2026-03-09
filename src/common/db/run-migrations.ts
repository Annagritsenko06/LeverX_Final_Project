import { migrator } from './migrator';

async function run() {
  const command = process.argv[2];

  if (command === 'down') {
    await migrator.down();
    console.log('Migrations reverted');
  } else {
    await migrator.up();
    console.log('Migrations applied');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
