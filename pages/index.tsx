import Layout from "components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/core";
import styles from "./index.module.css";
type BoardState = CellValue[];

interface BoardProps {
	state: BoardState;
	winningMoves: Move[];
	onClickCell: (id: number) => any;
}

function Board(props: BoardProps) {
	return (
		<div className={styles.board + " w-px"}>
			{props.state.map((s, i) => (
				<Cell
					key={i}
					value={s}
					id={i}
					isWin={props.winningMoves.map((m) => m.cellId).includes(i)}
					onClick={(id) => props.onClickCell(id)}
				/>
			))}
		</div>
	);
}

enum CellValue {
	None = " ",
	X = "X",
	O = "O",
}

interface CellProps {
	value: CellValue;
	id: number;
	onClick: (id: number) => any;
	isWin: boolean;
}

function Cell(props: CellProps) {
	return (
		<div
			onClick={(_) => props.onClick(props.id)}
			className={
				"gap-0 h-5 w-5 border border-black text-xl flex items-center font-bold justify-center text-" +
				(props.value === "X"
					? "red-800"
					: props.value === "O"
					? "blue-800"
					: "") +
				(props.isWin ? " bg-green-200" : "")
			}
		>
			{props.value}
		</div>
	);
}

function getWinner(moves: Move[]): Result | undefined {
	// Nobody can win with less than 5 moves ;)
	if (moves.length < 9) {
		return;
	}

	// Moves that won the game
	const winningMoves: Move[] = [];

	let hasWon = false;

	// Delta positions
	const deltas = [
		[1, 0],
		[0, 1],
		[1, 1],
		[1, -1],
	];

	const transformedMoves = moves.map((m) =>
		Object.assign(m, {
			x: m.cellId % 15,
			y: Math.floor(m.cellId / 15),
		})
	);

	const lastMove = transformedMoves[moves.length - 1];

	function getMoveByCoords(x: number, y: number) {
		return transformedMoves.find((m) => m.x === x && m.y === y);
	}

	deltas.forEach((delta1) => {
		let [deltaRow, deltaCol] = delta1;
		let consecutiveItems = 1;
		[1, -1].forEach((delta) => {
			deltaRow *= delta;
			deltaCol *= delta;
			let nextRow = lastMove.y + deltaRow;
			let nextCol = lastMove.x + deltaCol;
			while (
				0 <= nextRow &&
				nextRow < 15 &&
				0 <= nextCol &&
				nextCol < 15
			) {
				if (
					getMoveByCoords(nextCol, nextRow) &&
					getMoveByCoords(nextCol, nextRow)?.player ===
						lastMove.player
				) {
					consecutiveItems += 1;
					winningMoves.push(
						getMoveByCoords(nextCol, nextRow) as Move
					);
					winningMoves.push(lastMove);
				} else {
					break;
				}
				if (consecutiveItems === 5) {
					hasWon = true;
					break;
				}
				nextRow += deltaRow;
				nextCol += deltaCol;
			}
		});
	});

	if (hasWon) {
		return { winner: lastMove.player, winningMoves };
	} else {
		return;
	}
}

interface Move {
	cellId: number;
	player: CellValue;
}

function getMoveByCellId(cellId: number, moves: Move[]) {
	return moves.find((m) => m.cellId === cellId);
}

function movesToState(moves: Move[]): CellValue[] {
	return Array(225)
		.fill(null)
		.map(
			(_, index) =>
				getMoveByCellId(index, moves)?.player ?? CellValue.None
		);
}

interface Result {
	winner: CellValue;
	winningMoves: Move[];
}

const IndexPage = () => {
	const [moves, setMoves] = useState<Move[]>([]);
	const [currentPlayer, setCurrentPlayer] = useState<CellValue>(CellValue.X);
	const [result, setResult] = useState<Result | undefined>(undefined);

	useEffect(() => {
		const result = getWinner(moves);
		if (result) {
			setResult(result);
		}
	}, [JSON.stringify(moves)]);

	return (
		<Layout title="Gomloku">
			<div className={"m-5"}>
				<Button
					onClick={() => {
						setMoves([]);
						setResult(undefined);
					}}
				>
					Clear board state
				</Button>
				<h1 className="text-3xl">Gomloku</h1>
				<Board
					onClickCell={(id) => {
						if (
							moves.find((m) => m.cellId === id) ||
							result?.winner !== undefined
						) {
							return;
						}
						setMoves([
							...moves,
							{
								cellId: id,
								player: currentPlayer,
							},
						]);
						setCurrentPlayer(
							currentPlayer === CellValue.X
								? CellValue.O
								: CellValue.X
						);
					}}
					winningMoves={result?.winningMoves ?? []}
					state={movesToState(moves)}
				/>
				{moves.map((m) => (
					<div
						className={
							result?.winningMoves.includes(m)
								? "bg-green-200"
								: ""
						}
					>
						{m.player}: {m.cellId}
					</div>
				))}
			</div>
		</Layout>
	);
};

export default IndexPage;
