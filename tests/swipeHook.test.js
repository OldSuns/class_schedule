import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { useWeekSwipe } from "../src/hooks/ui/useWeekSwipe.js";

test("proven swipe hook triggers during horizontal touchmove and suppresses the following click", () => {
  let handlers;
  let leftCount = 0;
  const Harness = () => {
    handlers = useWeekSwipe({
      enabled: true,
      onSwipeLeft: () => {
        leftCount += 1;
      }
    });
    return null;
  };
  renderToStaticMarkup(React.createElement(Harness));

  handlers.onTouchStart({
    touches: [{ clientX: 220, clientY: 120 }]
  });
  let movePrevented = false;
  handlers.onTouchMove({
    touches: [{ clientX: 140, clientY: 126 }],
    cancelable: true,
    preventDefault: () => {
      movePrevented = true;
    }
  });

  assert.equal(leftCount, 1);
  assert.equal(movePrevented, true);

  let clickPrevented = false;
  let clickStopped = false;
  handlers.onClickCapture({
    preventDefault: () => {
      clickPrevented = true;
    },
    stopPropagation: () => {
      clickStopped = true;
    }
  });
  assert.equal(clickPrevented, true);
  assert.equal(clickStopped, true);
});

test("proven swipe hook leaves vertical scrolling untouched", () => {
  let handlers;
  let swipeCount = 0;
  const Harness = () => {
    handlers = useWeekSwipe({
      enabled: true,
      onSwipeLeft: () => {
        swipeCount += 1;
      }
    });
    return null;
  };
  renderToStaticMarkup(React.createElement(Harness));

  handlers.onTouchStart({
    touches: [{ clientX: 180, clientY: 100 }]
  });
  let movePrevented = false;
  handlers.onTouchMove({
    touches: [{ clientX: 168, clientY: 180 }],
    cancelable: true,
    preventDefault: () => {
      movePrevented = true;
    }
  });

  assert.equal(swipeCount, 0);
  assert.equal(movePrevented, false);
});
