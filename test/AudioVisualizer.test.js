describe("AudioVisualizer", () => {
    const Oscillope = Visualize.Oscillope;
    describe("constructor()", () => {
        let visual;

        beforeEach(() => {
            visual = new Oscillope();
        });

        it("should automatically create audio context and canvas", () => {
            expect(visual.analyser).to.be.ok;
            expect(visual.canvas).to.be.ok;
        });

        it("can set aspect ratio", () => {
            const aspectRatio = {
                width: 4,
                height: 3,
            };

            visual.aspectRatio = aspectRatio;
            expect(visual.aspectRatio).to.be.ok;
            expect(visual.aspectRatio.width).to.be.equal(4);
            expect(visual.aspectRatio.height).to.be.equal(3);

            //Test setting from constructor
            let visualTwo = new Oscillope({
                aspectRatio: {
                    width: 10,
                    height: 2,
                },
            });

            expect(visualTwo.aspectRatio).to.be.ok;
            expect(visualTwo.aspectRatio.width).to.be.equal(10);
            expect(visualTwo.aspectRatio.height).to.be.equal(2);
        });
    });

    describe("fromMediaElement()", () => {
        it("should be able to be created using an audio element", function () {
            let audio = document.createElement("audio");
            let visual = Oscillope.fromMediaElement(audio);
            expect(visual.analyser).to.be.ok;
            expect(visual.canvas).to.be.ok;
        });
    });

    describe("fromMediaStream()", () => {});

    describe("fps", () => {
        it("should delay", () => {
            return new Promise((resolve) => {
                let startTime = Date.now();
                const fps = 10;
                const targetThrottleTime = 1000 / fps;

                let visual = new Oscillope({ fps });
                document.body.appendChild(visual.canvas);
                visual.on("setUpForeground", () => {
                    const elapsedTime = Date.now() - startTime;
                    expect(elapsedTime).to.be.greaterThanOrEqual(targetThrottleTime);
                    visual.stop();
                    resolve();
                });

                visual.reset();
            });
        });
    });

    describe("_draw()", () => {
        it("should be able to set background colors", () => {
            return new Promise((resolve) => {
                let visual = new Oscillope();
                document.body.appendChild(visual.canvas);
                visual.backgroundColor = ["red", "gold"];
                visual.on("frameDrawn", () => {
                    //The frameDrawn callback got called, meaning we made it past setting up the background
                    expect(visual.backgroundColor).to.be.ok;
                    resolve();
                });
                visual.reset();
            });
        });
    });
});
