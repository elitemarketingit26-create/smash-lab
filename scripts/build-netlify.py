"""Build the configured preview or production into Netlify's fixed dist directory."""
from pathlib import Path
import importlib.util, json, shutil
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'seo/site-config.json').read_text())
spec=importlib.util.spec_from_file_location('smash_package',root/'scripts/package-smash-preview.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
source=module.build(production=bool(config.get('ready_for_indexing')))
target=root/'dist'
if target.exists():shutil.rmtree(target)
shutil.copytree(source,target)
print('Netlify publish directory:',target)
