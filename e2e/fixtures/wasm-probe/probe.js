WebAssembly.instantiate(new Uint8Array([0,97,115,109,1,0,0,0])).then(()=>{document.body.dataset.wasm="ok"},()=>{document.body.dataset.wasm="blocked"});
