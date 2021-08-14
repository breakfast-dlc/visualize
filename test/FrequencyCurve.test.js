describe("FrequencyGraph", () => {
    const FrequencyCurve = Visualize.FrequencyCurve;
    describe("construct()", () => {
        let visual = new FrequencyCurve();
        document.body.appendChild(visual.canvas);
        expect(visual).to.be.ok;
        expect(visual.canvas).to.be.ok;
        expect(visual.analyser).to.be.ok;
    });
});
