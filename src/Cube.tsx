import * as React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { Motion, spring } from "react-motion";
import styles from "./cube.css";

const emptyFace = <div className={styles.empty}>empty</div>;

type Props = {
  index: "front" | "right" | "back" | "left" | "top" | "bottom";
  size: number;
};

type State = {
  index: string;
  isMoved: boolean;
  isPressed: boolean;
  mouseXY: Array<number>;
  mouseDelta: Array<number>;
  distance: number;
  cube: {
    width: number;
    height: number;
    translate: {
      x: number;
      y: number;
      z: number;
    };
    rotateX: number;
    rotateY: number;
    rotateZ: number;
  };
  faces: {};
  children: Array<React.ReactNode>;
};

export const Cube: FunctionComponent<Props> = ({
  index = "front",
  size = 200,
  children
}) => {
  const faceSize = size / 2;

  const [state, setState] = useState<State>({
    index,
    isMoved: false,
    isPressed: false,
    mouseXY: [0, 0],
    mouseDelta: [0, 0],
    distance: 0,
    cube: {
      width: size,
      height: size,
      translate: {
        x: 0,
        y: 0,
        z: -faceSize
      },
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0
    },
    faces: {
      front: {
        translate: {
          x: 0,
          y: 0,
          z: faceSize
        },
        rotate: {
          x: 0,
          y: 1,
          z: 0,
          deg: 0
        }
      },
      right: {
        translate: {
          x: faceSize,
          y: 0,
          z: 0
        },
        rotate: {
          x: 0,
          y: 1,
          z: 0,
          deg: 90
        }
      },
      back: {
        translate: {
          x: 0,
          y: 0,
          z: -faceSize
        },
        rotate: {
          x: 0,
          y: 1,
          z: 0,
          deg: 180
        }
      },
      left: {
        translate: {
          x: -faceSize,
          y: 0,
          z: 0
        },
        rotate: {
          x: 0,
          y: 1,
          z: 0,
          deg: -90
        }
      },
      top: {
        translate: {
          x: 0,
          y: -faceSize,
          z: 0
        },
        rotate: {
          x: 1,
          y: 0,
          z: 0,
          deg: 90
        }
      },
      bottom: {
        translate: {
          x: 0,
          y: faceSize,
          z: 0
        },
        rotate: {
          x: 1,
          y: 0,
          z: 0,
          deg: -90
        }
      }
    },
    children: []
  });

  useEffect(() => {
    const { index, cube, faces } = state;
    const newChildren = children
      ? Array.isArray(children)
        ? [...children].slice(0, 6)
        : [children]
      : [];

    while (newChildren.length < 6) {
      newChildren.push(emptyFace);
    }

    setState({
      ...state,
      cube: {
        ...cube,
        rotateX: faces[index].rotate.x ? -faces[index].rotate.deg : 0,
        rotateY: faces[index].rotate.y ? -faces[index].rotate.deg : 0,
        rotateZ: 0
      },
      children: newChildren
    });
  }, []);

  const dragCube = () => {
    const { cube, mouseDelta } = state;
    const [dx, dy] = mouseDelta;

    const rotateX = cube.rotateX - dy;
    const absX = Math.abs(rotateX % 360);
    const rotateY =
      absX > 90 && absX < 270 ? cube.rotateY - dx : cube.rotateY + dx;

    setState({
      ...state,
      cube: {
        ...cube,
        rotateX,
        rotateY
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { pageX, pageY } = e;

    setState({
      ...state,
      isPressed: true,
      isMoved: false,
      mouseXY: [pageX, pageY]
    });

    e.preventDefault();
  };

  const handleMouseMove = (e: { pageX: number; pageY: number }) => {
    const { pageX, pageY } = e;
    const {
      isPressed,
      mouseXY: [mx, my]
    } = state;

    if (isPressed) {
      setState({
        ...state,
        mouseXY: [pageX, pageY],
        mouseDelta: [pageX - mx, pageY - my],
        isMoved: true
      });

      dragCube();
    }
  };

  const handleMouseUp = () => {
    const { isPressed } = state;

    if (isPressed) {
      setState({
        ...state,
        isPressed: false,
        mouseXY: [0, 0],
        mouseDelta: [0, 0]
      });
    }
  };

  return (
    <div className={styles.cubeWrapper}>
      <Motion
        style={{
          rotateX: spring(state.cube.rotateX),
          rotateY: spring(state.cube.rotateY),
          rotateZ: spring(state.cube.rotateZ)
        }}
      >
        {({ rotateX, rotateY, rotateZ }) => {
          return (
            <div
              className={styles.cube}
              style={{
                transform: `translate3d(${state.cube.translate.x}px, ${state.cube.translate.y}px, ${state.cube.translate.z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
              }}
            >
              {Object.keys(state.faces).map((face, key) => {
                const { translate, rotate } = state.faces[face];

                return (
                  <div
                    className={`${styles.cubeFace} ${styles[face]}`}
                    key={key}
                    style={{
                      transform: `translate3d(${translate.x}px, ${translate.y}px, ${translate.z}px) rotate3d(${rotate.x}, ${rotate.y}, ${rotate.z}, ${rotate.deg}deg)`,
                      width: state.cube.width,
                      height: state.cube.height
                    }}
                    onMouseDown={e => {
                      handleMouseDown(
                        e as React.MouseEvent<HTMLDivElement, MouseEvent>
                      );
                    }}
                    onMouseMove={e => {
                      handleMouseMove(e);
                    }}
                    onMouseLeave={() => {
                      handleMouseUp();
                    }}
                    onMouseUp={() => {
                      handleMouseUp();
                    }}
                  >
                    {children && children[key]}
                  </div>
                );
              })}
            </div>
          );
        }}
      </Motion>
    </div>
  );
};
