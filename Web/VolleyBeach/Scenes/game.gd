extends Node2D

@onready var score_left_display  = $ScoreLeft
@onready var score_right_display = $ScoreRight
@onready var ball  = $Ball

func _ready() -> void:
	ScoreManager.ball_node = ball
	ScoreManager.net_x     = $Ball_net.global_position.x
	ScoreManager.ground_y  = $Bottom_Ground.global_position.y
	ScoreManager.reset()
	ScoreManager.score_changed.connect(_on_score_changed)
	ScoreManager.game_over.connect(_on_game_over)

func _on_score_changed(player: int, new_score: int) -> void:
	if player == 0:
		score_left_display.set_score(new_score)
	else:
		score_right_display.set_score(new_score)

func _on_game_over(winner: int) -> void:
	print("Player %d wins!" % (winner + 1))
	await get_tree().create_timer(3.0).timeout
	get_tree().change_scene_to_file("res://Scenes/result_board.tscn")
	
	
