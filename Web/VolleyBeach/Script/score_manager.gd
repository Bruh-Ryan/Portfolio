extends Node

# ScoreManager — Autoload singleton
# Tracks scores for both players, detects ball out-of-bounds, emits signals.

signal score_changed(player: int, new_score: int)
signal game_over(winner: int)

const WIN_SCORE := 7

var score_left := 0
var score_right := 0

# Set from Game.tscn after ready
var ball_node: RigidBody2D = null
var net_x: float = 960.0         # world-X of the net centre (set by Game)
var ground_y: float = 540.0      # world-Y of the floor (set by Game)

# Cooldown so one ball-drop only scores once
var _scoring := false

func reset() -> void:
	score_left  = 0
	score_right = 0
	_scoring    = false
	emit_signal("score_changed", 0, 0)
	emit_signal("score_changed", 1, 0)

func _process(_delta: float) -> void:
	if _scoring or ball_node == null or not is_instance_valid(ball_node):
		return

	var bpos: Vector2 = ball_node.global_position

	# Ball has hit the floor area (within a generous threshold)
	if bpos.y >= ground_y - 60:
		_scoring = true
		# Ball landed on LEFT side  → point for RIGHT player (index 1)
		# Ball landed on RIGHT side → point for LEFT  player (index 0)
		if bpos.x < net_x:
			_add_point(1)
		else:
			_add_point(0)

func _add_point(player: int) -> void:
	if player == 0:
		score_left += 1
		emit_signal("score_changed", 0, score_left)
		if score_left >= WIN_SCORE:
			emit_signal("game_over", 0)
			return
	else:
		score_right += 1
		emit_signal("score_changed", 1, score_right)
		if score_right >= WIN_SCORE:
			emit_signal("game_over", 1)
			return

	# Short pause then allow scoring again (ball should be respawned by players)
	await get_tree().create_timer(1.5).timeout
	_scoring = false
