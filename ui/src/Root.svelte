<script type="ts">
	export let squares = [
		{ id: 1, value: " " },
		{ id: 2, value: " " },
		{ id: 3, value: " " },
		{ id: 4, value: " " },
		{ id: 5, value: " " },
		{ id: 6, value: " " },
		{ id: 7, value: " " },
		{ id: 8, value: " " },
		{ id: 9, value: " " },
	];

	let counter: number = 0;

	let winner = "default";

	function set(c: number): void {
		if (squares[c - 1].value == " " && counter % 2 == 0) {
			squares[c - 1].value = "X";
			counter++;
		}
		if (squares[c - 1].value == " " && counter % 2 == 1) {
			squares[c - 1].value = "O";
			counter++;
		}
		if (
			(squares[0].value == squares[1].value &&
				squares[0].value == squares[2].value &&
				squares[0].value != " ") ||
			(squares[3].value == squares[4].value &&
				squares[3].value == squares[5].value &&
				squares[3].value != " ") ||
			(squares[6].value == squares[7].value &&
				squares[6].value == squares[8].value &&
				squares[6].value != " ") ||
			(squares[0].value == squares[3].value &&
				squares[0].value == squares[6].value &&
				squares[0].value != " ") ||
			(squares[1].value == squares[4].value &&
				squares[1].value == squares[7].value &&
				squares[1].value != " ") ||
			(squares[2].value == squares[5].value &&
				squares[2].value == squares[8].value &&
				squares[2].value != " ") ||
			(squares[4].value == squares[0].value &&
				squares[4].value == squares[8].value &&
				squares[4].value != " ") ||
			(squares[4].value == squares[2].value &&
				squares[4].value == squares[6].value &&
				squares[4].value != " ")
		) {
			if (counter % 2 == 0) {
				winner = "O wins!";
			}
			if (counter % 2 == 1) {
				winner = "X wins!";
			}
		}
		if (counter == 9 && winner == "default") {
			winner = "Draw!";
		}
	}

	function reset() {
		squares = [
			{ id: 1, value: " " },
			{ id: 2, value: " " },
			{ id: 3, value: " " },
			{ id: 4, value: " " },
			{ id: 5, value: " " },
			{ id: 6, value: " " },
			{ id: 7, value: " " },
			{ id: 8, value: " " },
			{ id: 9, value: " " },
		];
		counter = 0;
		winner = "default";
	}
</script>

<main>
	{#if counter < 10}
		<div class="field">
			{#each squares as i (i.id)}
				<div class="block{i.id}">
					<button
						on:click|preventDefault={() => {
							if (winner == "default") {
								set(i.id);
							}
						}}><h2>{squares[i.id - 1].value}</h2></button
					>
				</div>
			{/each}
		</div>
	{/if}
	{#if winner == "default"}
		{#if counter % 2 == 0}
			<h2>Player X turn</h2>
		{/if}
		{#if counter % 2 == 1}
			<h2>Player O turn</h2>
		{/if}
	{/if}
	{#if winner != "default"}
		<h2>Game Done!</h2>
		<h2>{winner}</h2>
		<button on:click={() => reset()}>Reset</button>
	{/if}
</main>

<style lang="scss">
	.field {
		background-color: green;
		display: grid;
		grid-template-areas:
			"1 2 3"
			"4 5 6"
			"7 8 9";
		padding: 1%;
		width: 500px;
		height: 500px;
	}
	button {
		width: 93%;
		height: 93%;
	}
</style>
