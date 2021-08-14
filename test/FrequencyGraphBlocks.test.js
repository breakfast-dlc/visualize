describe("FrequencyGraph", () => {
    const FrequencyGraphBlocks = Visualize.FrequencyGraphBlocks;
    describe("construct()", () => {
        let visual = new FrequencyGraphBlocks();
        document.body.appendChild(visual.canvas);
        expect(visual).to.be.ok;
        expect(visual.canvas).to.be.ok;
        expect(visual.analyser).to.be.ok;
    });

    describe("_draw()", () => {
        it("Can set multiple foreground colors", () => {
            return new Promise((resolve) => {
                let visual = new FrequencyGraphBlocks();
                document.body.appendChild(visual.canvas);
                visual.color = ["blue", "red", "green"];
                visual.on("frameDrawn", () => {
                    //This callback was triggered, meaning we successfully made it past the foreground color processing stage
                    expect(visual.color).to.be.ok;
                    resolve();
                });
                visual.reset();
            });
        });
    });
});
