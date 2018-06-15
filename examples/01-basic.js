let v = new Vue({
    el: '#app',
    components: {
        "grid-layout": window.vuegrid.VueGridLayout.GridLayout,
        "grid-item": window.vuegrid.VueGridLayout.GridItem
    },
    data: {
        layout: [
            { x: 0,     y: 0,   w: 2,   h: 2,   i: "0",     title: "finna" },
            { x: 2,     y: 0,   w: 2,   h: 4,   i: "1",     title: "finna" },
            { x: 4,     y: 0,   w: 2,   h: 5,   i: "2",     title: "finna" },
            { x: 6,     y: 0,   w: 2,   h: 3,   i: "3",     title: "finna" },
            { x: 8,     y: 0,   w: 2,   h: 3,   i: "4",     title: "finna" },
            { x: 10,    y: 0,   w: 2,   h: 3,   i: "5",     title: "finna" },
            { x: 0,     y: 5,   w: 2,   h: 5,   i: "6",     title: "finna" },
            { x: 2,     y: 5,   w: 2,   h: 5,   i: "7",     title: "finna" },
            { x: 4,     y: 5,   w: 2,   h: 5,   i: "8",     title: "finna" },
            { x: 6,     y: 4,   w: 2,   h: 4,   i: "9",     title: "finna" },
            { x: 8,     y: 4,   w: 2,   h: 4,   i: "10",    title: "finna" },
            { x: 10,    y: 4,   w: 2,   h: 4,   i: "11",    title: "finna" },
            { x: 0,     y: 10,  w: 2,   h: 5,   i: "12",    title: "finna" },
            { x: 2,     y: 10,  w: 2,   h: 5,   i: "13",    title: "finna" },
            { x: 4,     y: 8,   w: 2,   h: 4,   i: "14",    title: "finna" },
            { x: 6,     y: 8,   w: 2,   h: 4,   i: "15",    title: "finna" },
            { x: 8,     y: 10,  w: 2,   h: 5,   i: "16",    title: "finna" },
            { x: 10,    y: 4,   w: 2,   h: 2,   i: "17",    title: "finna" },
            { x: 0,     y: 9,   w: 2,   h: 3,   i: "18",    title: "finna" },
            { x: 2,     y: 6,   w: 2,   h: 2,   i: "19",    title: "finna" }
        ]
    }
});

// setInterval(() => {
//     // v.$data.layout.push({ x: 15, y: 15, w: 1, h: 4, i: (new Date()).toDateString() });
//     // v.$data.layout[5].w++;
//     let x = v.$data.layout[5];
//     x[5].w++;
//     v.$set(v.$data, "layout", x);
// }, 1000);