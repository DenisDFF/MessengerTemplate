# HOW WORK MESSENGERS

## Just a few words

Hello, in this repository I updated one interesting project. One day I was wondering how messengers work, maybe you are thinking about it too. So I started scouring github looking for a good implementation of this idea. And i found [this](https://github.com/sudheeshshetty/Chat). 

But let's be honest, the way it looks and the way it works is not modern. So I wanted to play around with this project a bit and learn how to fix something old. We have to give credit to this project for a lot of work, though. 

## What I'm changing

The first thing that happened to this old project was timing. Mongoose is obsolete, and methods that worked in the controller don't work now. It's horrible to change them all, mostly problems with the connection methods. The solution to this problem was to change all connection methods to the new ones and update mongoose in node lib. The old project had v.4 mongoose and I upgraded to v8.

I don't like the way this "Facebook" design looks in the old project, and when I don't like something, I try to change it. The catalog of the old project had a lot of photos and avatars in it, but, I don't know why, the author doesn't use them. I changed the color, created new styles and added photos. I think new design looks horrible too, but importent thit i made it.
